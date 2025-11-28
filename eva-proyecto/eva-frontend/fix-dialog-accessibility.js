// Script to fix DialogContent accessibility issues
// This script identifies files that need DialogTitle for accessibility

const fs = require('fs');
const path = require('path');

// Files that likely need DialogTitle based on the search results
const filesToFix = [
  'src/components/Contacts.jsx',
  'src/components/modals/add-contingency-modal.jsx',
  'src/components/modals/add-equipment-modal.jsx',
  'src/components/modals/add-manuales-modal.jsx',
  'src/components/modals/add-observacion-modal.jsx',
  'src/components/modals/add-purchase-order-modal.jsx',
  'src/components/modals/agregar-baja-modal.jsx',
  'src/components/modals/agregar-observacion-modal.jsx',
  'src/components/modals/agregar-registro-invima-modal.jsx',
  'src/components/modals/calibration-modal-old.jsx',
  'src/components/modals/calibration-modal.jsx',
  'src/components/modals/clean-names-modal.jsx',
  'src/components/modals/concluir-observacion-modal.jsx',
  'src/components/modals/copy-equipment-modal.jsx',
  'src/components/modals/corrective-modal.jsx',
  'src/components/modals/create-corrective-modal.jsx',
  'src/components/modals/dar-baja-equipo-modal.jsx',
  'src/components/modals/delete-confirm-modal.jsx',
  'src/components/modals/DeleteModal.jsx',
  'src/components/modals/document-list-modal.jsx',
  'src/components/modals/document-upload-modal.jsx',
  'src/components/modals/download-all-pdf-modal.jsx',
  'src/components/modals/download-individual-modal.jsx',
  'src/components/modals/edit-equipment-modal.jsx',
  'src/components/modals/edit-manuales-modal.jsx',
  'src/components/modals/editar-baja-modal.jsx',
  'src/components/modals/editar-observaciones-modal.jsx',
  'src/components/modals/EditModal.jsx',
  'src/components/modals/eliminar-equipo-modal.jsx',
  'src/components/modals/equipos-asociados-modal.jsx',
  'src/components/modals/export-consolidado-modal.jsx',
  'src/components/modals/export-plantilla-modal.jsx',
  'src/components/modals/filter-modal.jsx',
  'src/components/modals/hospital-ticket-modal.jsx',
  'src/components/modals/life-modal.jsx',
  'src/components/modals/manual-search-modal.jsx',
  'src/components/modals/merge-modal.jsx',
  'src/components/modals/observaciones-modal.jsx',
  'src/components/modals/order-search-modal.jsx',
  'src/components/modals/pdf-modal.jsx',
  'src/components/modals/query-purchase-order-modal-backup.jsx',
  'src/components/modals/query-purchase-order-modal.jsx',
  'src/components/modals/quick-guide-search-modal.jsx',
  'src/components/modals/secop-consultation-modal-new.jsx',
  'src/components/modals/secop-consultation-modal-old.jsx',
  'src/components/modals/secop-consultation-modal.jsx',
  'src/components/modals/share-document-modal.jsx',
  'src/components/modals/tabla-equipos-asociar.jsx',
  'src/components/modals/ver-documentacion-modal.jsx',
  'src/components/modals/view-equipment-modal.jsx',
  'src/components/modals/ViewModal.jsx',
  'src/components/modals/work-order-closure-modal.jsx'
];

console.log('Files that may need DialogTitle for accessibility:');
filesToFix.forEach(file => {
  console.log(`- ${file}`);
});

console.log(`\nTotal files to check: ${filesToFix.length}`);
console.log('\nTo fix these files, add DialogTitle import and use it inside DialogContent:');
console.log('1. Import: import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";');
console.log('2. Add inside DialogContent: <DialogTitle className="sr-only">Modal Title</DialogTitle>');