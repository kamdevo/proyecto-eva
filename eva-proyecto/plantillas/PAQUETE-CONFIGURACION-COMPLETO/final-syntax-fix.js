const fs = require('fs');
const path = require('path');

const modalPaths = [
  'c:\\Users\\Soporte\\Desktop\\code}\\eva\\proyecto-eva\\eva-proyecto\\eva-frontend\\src\\components\\modals',
  'c:\\Users\\Soporte\\Desktop\\code}\\eva\\proyecto-eva\\eva-proyecto\\eva-frontend\\src\\components\\ui'
];

function fixAllSyntaxErrors(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let fixed = false;
    
    // Fix comma before DialogDescription
    if (content.includes(', DialogDescription')) {
      content = content.replace(/,\s*DialogDescription/g, 'DialogDescription');
      fixed = true;
    }
    
    // Fix merged DialogTitleDialogDescription
    if (content.includes('DialogTitleDialogDescription')) {
      content = content.replace(/DialogTitleDialogDescription/g, 'DialogTitle, DialogDescription');
      fixed = true;
    }
    
    // Fix missing comma between DialogTitle and DialogDescription
    const titleDescRegex = /DialogTitle\s+DialogDescription/g;
    if (titleDescRegex.test(content)) {
      content = content.replace(titleDescRegex, 'DialogTitle, DialogDescription');
      fixed = true;
    }
    
    // Fix double commas
    if (content.includes(',,')) {
      content = content.replace(/,\s*,/g, ',');
      fixed = true;
    }
    
    // Fix trailing commas in imports
    content = content.replace(/,\s*}\s*from/g, ' } from');
    
    if (fixed) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dirPath) {
  try {
    const files = fs.readdirSync(dirPath);
    let fixedCount = 0;
    
    files.forEach(file => {
      if (file.endsWith('.jsx') || file.endsWith('.tsx')) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isFile()) {
          if (fixAllSyntaxErrors(filePath)) {
            console.log(`Fixed: ${file}`);
            fixedCount++;
          }
        }
      }
    });
    
    return fixedCount;
  } catch (error) {
    console.error(`Error processing directory ${dirPath}:`, error.message);
    return 0;
  }
}

console.log('Final syntax fix...');
let totalFixed = 0;

modalPaths.forEach(dirPath => {
  if (fs.existsSync(dirPath)) {
    console.log(`Processing: ${dirPath}`);
    totalFixed += processDirectory(dirPath);
  }
});

console.log(`Total files fixed: ${totalFixed}`);