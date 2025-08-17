import bcrypt from 'bcrypt';
import generateToken from '../utils/generateToken.js';
import User from '../models/User.js';
import LinkToken from '../models/Token.js';
import jwt from 'jsonwebtoken';

/* REGISTER USER */

export const register = async (req, res) => {
	try {
		const { firstName, lastName, email, password } = req.body;

		const { linkToken } = req.params;
		const tokenFound = await LinkToken.findOne({ token: linkToken });
		if (!tokenFound) {
			return res.status(404).json({ message: 'Enlace Inválido' });
		}
		const tokenData = jwt.verify(linkToken, process.env.JWT_SECRET);

		const filename = req.file?.filename || '';

		const emailFound = await User.findOne({ email });
		if (emailFound) {
			return res
				.status(403)
				.json({ message: 'Este email ya se encuentra registrado.' });
		}

		const salt = await bcrypt.genSalt();
		const passwordHash = await bcrypt.hash(password, salt);

		const newUser = new User({
			firstName,
			lastName,
			email,
			position: tokenData.position,
			department: tokenData.department,
			hrPrivilege: tokenData.hrPrivilege,
			adminPrivilege: tokenData.adminPrivilege,
			password: passwordHash,
			picturePath: filename,
		});

		const savedUser = await newUser.save();

		await LinkToken.deleteOne({ token: tokenFound.token });
		const token = generateToken(res, savedUser._id);
		res.status(201).json({ savedUser, token });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

/*  LOGGIN IN */
export const login = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });
		console.log(req.body, user);
		if (!user) {
			return res.status(400).json({ message: 'Este usuario no existe.' });
		}
		const userObject = user.toObject();

		const isMatch = await bcrypt.compare(password, user.password);
		delete userObject.password;

		if (!isMatch) {
			return res
				.status(400)
				.json({ message: 'Correo o contraseña inválidos.' });
		}

		const token = generateToken(res, user._id);
		res.status(200).json({ userObject, token });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

export const logout = async (req, res) => {
	try {
		res.cookie('jwt', '', {
			httpOnly: true,
			expires: new Date(0),
		});

		res.status(200).json({ message: 'User logged out' });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

export const generateTemplink = async (req, res) => {
	try {
		const { position, department, hrPrivilege, adminPrivilege } = req.body;

		const token = jwt.sign(
			{
				position,
				department,
				hrPrivilege,
				adminPrivilege,
			},
			process.env.JWT_SECRET,
			{
				expiresIn: '24h',
			}
		);

		const newToken = new LinkToken({ token });
		const savedToken = await newToken.save();

		res.status(200).json({ savedToken });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

export const getTokenData = async (req, res) => {
	try {
		const { token } = req.params;

		const tokenFound = await LinkToken.findOne({ token });

		if (!tokenFound) {
			return res.status(404).json({ message: 'Enlace no válido' });
		}

		const tokenData = jwt.verify(token, process.env.JWT_SECRET);
		res.status(200).json(tokenData);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};
