import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Minimal styles - no complex properties
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    color: '#2563eb',
  },
  section: {
    marginBottom: 10,
    padding: 10,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
});

export const MinimalTestPDF = ({ equipment }) => {
  // Ensure equipment exists and has safe values
  const safeEquipment = equipment || {};
  const equipmentName = safeEquipment.name || 'Test Equipment';
  const equipmentCode = safeEquipment.code || 'TEST-001';
  const equipmentId = safeEquipment.id || '1';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Equipment Test PDF</Text>
        
        <View style={styles.section}>
          <Text style={styles.text}>Equipment ID: {equipmentId}</Text>
          <Text style={styles.text}>Equipment Name: {equipmentName}</Text>
          <Text style={styles.text}>Equipment Code: {equipmentCode}</Text>
          <Text style={styles.text}>Generated: {new Date().toLocaleDateString()}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.text}>This is a minimal test PDF to verify React PDF renderer is working.</Text>
          <Text style={styles.text}>If you can see this PDF, the basic functionality is working correctly.</Text>
        </View>
      </Page>
    </Document>
  );
};
