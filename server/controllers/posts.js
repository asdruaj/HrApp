import Post from '../models/Posts.js'
import User from '../models/User.js'

/* CREATE */

export const createPost = async (req, res) => {
  try {
    const { userId, description, picturePath } = req.body
    const user = await User.findById(userId)

    const newPost = new Post({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      description,
      userPicturePath: user.userPicturePath,
      picturePath,
      likes: {},
      comments: []
    })

    await newPost.save()

    const posts = await Post.find()

    res.status(201).json(posts)
  } catch (err) {
    res.status(409).json({ message: err.message })
  }
}

/* READ */

export const getFeedPosts = async (req, res) => {
  try {
    const posts = await Post.find()
    res.status(200).json(posts)
  } catch (err) {
    res.status(404).json({ message: err.message })
  }
}

/* UPDATE */
export const likePost = async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.body
    const post = await Post.findById(id)
    const isLiked = post.likes.get(userId)

    if (isLiked) {
      post.likes.delete(userId)
    } else {
      post.likes.set(userId, true)
    }

    const updatedPost = await Post.findById(
      id,
      { likes: post.likes },
      { new: true }
    )
    res.status(200).json(updatedPost)
  } catch (err) {
    res.status(404).json({ message: err.message })
  }
}
