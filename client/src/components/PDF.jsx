import {
  Document,
  Text,
  Page,
  StyleSheet,
  View
} from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { fontSize: 12, textAlign: 'justify' },
  header: { marginHorizontal: 30, marginTop: 30 },
  section: { margin: 30 },
  paragraph: { marginBottom: 15 },
  paragraphLong: { marginBottom: 60 }
})

const PDF = ({ data }) => {
  const date = new Date().toLocaleDateString()
  return (
    <Document>
      <Page size='A4' style={styles.page}>
        <View style={styles.header}>
          <Text>{date}</Text>
          <Text>Banco XXXXX</Text>
          <Text>Estimados Señores:</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.paragraph}>Por medio de la presente, MarOil Trading INC., con Registro de Información Fiscal (RIF) [Número de RIF], tiene el honor de solicitar la apertura de una cuenta corriente para nómina a nombre de {data.firstName} {data.lastName}, cuyo Documento de Identidad (C.I.) es {data.idDocument}, con el fin de realizar el pago de sus remuneraciones a través de este medio.</Text>
          <Text style={styles.paragraph}>{data.firstName} {data.lastName} se ha incorporado recientemente a nuestra nómina como {data.position}</Text>
          <Text style={styles.paragraph}>Solicitamos que la cuenta sea abierta con las siguientes características:

          </Text>

          <Text style={styles.paragraph}>
            Tipo de cuenta: Corriente en bolívares.
          </Text>
          <Text style={styles.paragraph}>
            Firma autorizada: {data.firstName} {data.lastName}
          </Text>

          <Text style={styles.paragraph}>
            Modalidad de pago: Transferencia electrónica desde la cuenta de nómina de MarOilTrading INC.
          </Text>
          <Text style={styles.paragraphLong}>
            Agradecemos su atención a esta solicitud y esperamos contar con su pronta respuesta. Quedamos a su entera disposición para cualquier información adicional que puedan requerir.
          </Text>
          <Text style={styles.paragraph}>
            Atentamente,
          </Text>
          <Text>
            _________________________
          </Text>
        </View>

      </Page>
    </Document>
  )
}

export default PDF
