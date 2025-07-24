import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Simple styles for testing
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
    color: '#2563eb',
  },
  section: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f8fafc',
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  value: {
    fontSize: 10,
    color: '#374151',
  },
});

export const TestPDFSimple = ({ equipment }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Test PDF - Equipment Report</Text>
        
        <View style={styles.section}>
          <Text style={styles.label}>Equipment ID:</Text>
          <Text style={styles.value}>{equipment?.id || 'N/A'}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.label}>Equipment Name:</Text>
          <Text style={styles.value}>{equipment?.name || 'N/A'}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.label}>Code:</Text>
          <Text style={styles.value}>{equipment?.code || 'N/A'}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.label}>Serial:</Text>
          <Text style={styles.value}>{equipment?.serial || 'N/A'}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.label}>Brand:</Text>
          <Text style={styles.value}>{equipment?.marca || 'N/A'}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.label}>Model:</Text>
          <Text style={styles.value}>{equipment?.modelo || 'N/A'}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.label}>Acquisition Date:</Text>
          <Text style={styles.value}>{equipment?.fecha_ad || 'N/A'}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.label}>Manufacturing Date:</Text>
          <Text style={styles.value}>{equipment?.fecha_fabricacion || 'N/A'}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.label}>Installation Date:</Text>
          <Text style={styles.value}>{equipment?.fecha_instalacion || 'N/A'}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.label}>Cost:</Text>
          <Text style={styles.value}>{equipment?.costo ? `$${equipment.costo}` : 'N/A'}</Text>
        </View>
        
        <Text style={{ fontSize: 8, textAlign: 'center', marginTop: 20, color: '#6b7280' }}>
          Generated on {new Date().toLocaleDateString('es-ES')} at {new Date().toLocaleTimeString('es-ES')}
        </Text>
      </Page>
    </Document>
  );
};
