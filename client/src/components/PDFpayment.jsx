import {
  Document,
  Text,
  Page,
  StyleSheet,
  View
} from '@react-pdf/renderer'
import dayjs from 'dayjs'

const styles = StyleSheet.create({
  page: { fontSize: 12, textAlign: 'justify' },
  header: { margin: 30 },
  section: { margin: 30 },
  paragraph: { marginBottom: 15, marginLeft: 30 },
  ml: { marginLeft: 40 },
  paragraphShort: { marginBottom: -15 },
  paragraphLong: { marginBottom: 30 },
  paragraphLongAlt: { marginBottom: 30, marginLeft: 40 },
  title: { fontSize: 16, fontStyle: 'bold', textAlign: 'center', marginTop: -15, marginBottom: 10 }
})

const PDFpayment = ({ data }) => {
  const day = dayjs().date()
  const period = day > 15 && day <= 30 ? '1' + '/' + (dayjs().month() + 1) + '-' + '15' + '/' + (dayjs().month() + 1) : '16' + '/' + (dayjs().month() + 1) + '-' + '30' + '/' + (dayjs().month() + 1)

  return (
    <Document>
      <Page size='A4' style={styles.page}>
        <View style={styles.header}>
          <Text>{period} <Text style={styles.ml}>Año: {dayjs().year()}</Text></Text>
          <Text>{period} <Text style={styles.ml}>Año: {dayjs().year()}</Text></Text>
          <Text>{`${data.firstName} ${data.lastName}`}</Text>
          <Text>{data.id}</Text>
          <Text style={styles.paragraphLong}>MarOil Trading Inc.</Text>
        </View>

        <Text style={styles.title}>
          RESUMEN DE PAGO
        </Text>
        <View>

          <Text style={styles.paragraph}>Frecuencia de Pagos </Text>
          <Text style={styles.paragraph}>{data.payFrequency} </Text>

          <Text style={styles.paragraph}>Proporción de Quincenas</Text>
          <Text style={styles.paragraph}>El 15 del mes: {data.payFrequency === 'Mensual' ? '0%' : '50%'}</Text>
          <Text style={styles.paragraph}>El 30 del mes: {data.payFrequency === 'Mensual' ? '100%' : '50%'}</Text>

          <Text style={styles.paragraph}>Monto de sueldo el 15: {data.payFrequency === 'Mensual' ? '0' : parseFloat(data.baseSalary / 2).toFixed(2)}</Text>
          <Text style={styles.paragraphLongAlt}>Monto de Sueldo el 30: {data.payFrequency === 'Mensual' ? parseFloat(data.baseSalary).toFixed(2) : parseFloat(data.baseSalary / 2).toFixed(2)}</Text>

          <Text style={styles.paragraph}>Deducciones </Text>
          <Text style={styles.paragraph}>Retención del Seguro Social: {data.retentionTotal} </Text>
          <Text style={styles.paragraph}>Paro Forzoso: {data.paroTotal} </Text>
          <Text style={styles.paragraph}>Ley de Política Habitacional:{data.LPHtotal} </Text>
          <Text style={styles.paragraphLongAlt}>Bajas Injustificadas: {(data.baseSalary / 30) * data.unjustifiedAbsences} </Text>

          <Text style={styles.ml}>Total de Sueldo el 30: {data.payFrequency === 'Mensual' ? parseFloat(data.baseSalary - data.monthlyTotal - ((data.baseSalary / 30) * data.unjustifiedAbsences)) : parseFloat((data.baseSalary / 2) - data.monthlyTotal - ((data.baseSalary / 30) * data.unjustifiedAbsences))} BsS.
          </Text>
        </View>
      </Page>
    </Document>
  )
}

export default PDFpayment
