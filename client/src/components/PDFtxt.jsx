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
  paragraph: { marginBottom: 15 },
  ml: { marginleft: 30 },
  paragraphShort: { marginBottom: -15 },
  paragraphLong: { marginBottom: 60 },

  row: {
    marginVertical: 10,
    marginHorizontal: 30,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  left: {
    flexShrink: 1,
    flexBasis: 200
  },
  middle: {
    flexShrink: 1,
    flexBasis: 200
  },

  right: {
    flexShrink: 1,
    flexBasis: 200
  }
})

const PDFtxt = ({ data }) => {
  const day = dayjs().date()
  const period = day > 15 && day <= 30 ? '1' + '/' + (dayjs().month() + 1) + '-' + '15' + '/' + (dayjs().month() + 1) : '16' + '/' + (dayjs().month() + 1) + '-' + '30' + '/' + (dayjs().month() + 1)
  return (
    <Document>
      <Page size='A4' style={styles.page}>
        <View style={styles.header}>
          <Text>Nómina Período: {period} <Text style={styles.ml}>Año: {dayjs().year()}</Text></Text>
          <Text>MarOil Trading Inc.</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.paragraphShort}>ID </Text>
          <Text style={styles.paragraphShort}>N° de Cuenta </Text>
          <Text style={styles.paragraphShort}>Monto</Text>

        </View>

        {
          data?.map(item => (
            item.ammount !== 0 &&
              <View key={item.id} style={styles.row}>

                <Text style={styles.paragraphShort}>{item.id} </Text>
                <Text style={styles.paragraphShort}>{item.accNumber} </Text>
                <Text style={styles.paragraphShort}>{item.ammount} BsS.</Text>

              </View>
          ))
        }

      </Page>
    </Document>
  )
}

export default PDFtxt
