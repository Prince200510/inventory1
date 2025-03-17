import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 10,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
});

// Create PDF component
const PDFDocument = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text>Customer Name: {data.customerName}</Text>
        <Text>Customer Address: {data.customerAddress}</Text>
        <Text>Order Date: {data.date}</Text>
        {/* Add more fields as needed */}
      </View>
    </Page>
  </Document>
);

export default PDFDocument;
