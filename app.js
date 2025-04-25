const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');
require('jspdf-autotable');
const app = express();
const port = 3000;

// Configurar middleware
app.use(bodyParser.json());
app.use(express.static('static'));
app.use(express.static('outputs'));

// Asegurar que el directorio outputs exista
const outputDir = path.join(__dirname, 'outputs');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Cargar datos de ejemplo y colores predeterminados
function loadJsonData(filename) {
  try {
    const filepath = path.join(__dirname, 'data', filename);
    const data = fs.readFileSync(filepath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error al cargar ${filename}:`, error);
    return {};
  }
}

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

// Ruta para obtener ejemplos de campos
app.get('/ejemplos/:campo', (req, res) => {
  try {
    const campo = req.params.campo;
    const examples = loadJsonData('field_examples.json');
    
    if (examples[campo]) {
      res.json({ example: examples[campo] });
    } else {
      res.status(404).json({ error: 'Ejemplo no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para obtener colores predeterminados
app.get('/colores', (req, res) => {
  try {
    const colors = loadJsonData('default_colors.json');
    res.json(colors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Validación de datos
function validateData(data) {
  const errors = [];
  
  // Validar campos obligatorios
  const requiredFields = ['nombre', 'email', 'telefono'];
  for (const field of requiredFields) {
    if (!data[field] || !data[field].trim()) {
      errors.push(`El campo ${field} es obligatorio`);
    }
  }
  
  // Validar formato de email
  if (data.email && data.email.trim()) {
    const emailRegex = /^[\w\.-]+@[\w\.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(data.email)) {
      errors.push('Formato de email inválido');
    }
  }
  
  // Validar formato de teléfono
  if (data.telefono && data.telefono.trim()) {
    const phoneRegex = /^[\d\s\+\-\(\)]{8,15}$/;
    if (!phoneRegex.test(data.telefono)) {
      errors.push('Formato de teléfono inválido');
    }
  }
  
  // Validar URLs
  const urlFields = ['linkedin', 'portfolio', 'sitio_web'];
  const urlRegex = /^https?:\/\/(?:[-\w.]|(?:%[\da-fA-F]{2}))+/;
  for (const field of urlFields) {
    if (data[field] && data[field].trim() && !urlRegex.test(data[field])) {
      errors.push(`La URL de ${field} debe comenzar con http:// o https://`);
    }
  }
  
  return errors;
}

// Función para generar CV con estilo ATS
function generateAtsCv(data, filename) {
  // Crear un nuevo documento PDF
  const doc = new jsPDF();
  
  // Obtener color principal o usar uno predeterminado
  const colorPrincipal = data.color_principal || '#2c3e50';
  // Convertir HEX a componentes RGB (0-1)
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : { r: 0.17, g: 0.24, b: 0.31 }; // Color predeterminado si hay error
  };
  
  const rgb = hexToRgb(colorPrincipal);
  
  // Información personal - Nombre
  doc.setFontSize(16);
  doc.setTextColor(rgb.r * 255, rgb.g * 255, rgb.b * 255);
  doc.setFont('helvetica', 'bold');
  doc.text(data.nombre || '', 20, 20);
  
  // Profesión
  if (data.profesion) {
    doc.setFontSize(14);
    doc.text(data.profesion, 20, 28);
  }
  
  // Información de contacto
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  
  const contactInfo = [];
  if (data.email) contactInfo.push(`Email: ${data.email}`);
  if (data.telefono) contactInfo.push(`Teléfono: ${data.telefono}`);
  if (data.direccion) contactInfo.push(`Dirección: ${data.direccion}`);
  if (data.linkedin) contactInfo.push(`LinkedIn: ${data.linkedin}`);
  if (data.sitio_web) contactInfo.push(`Sitio Web: ${data.sitio_web}`);
  
  if (contactInfo.length > 0) {
    doc.text(contactInfo.join(' | '), 20, 36);
  }
  
  let yPos = 45;
  
  // Resumen profesional
  if (data.resumen) {
    doc.setFontSize(14);
    doc.setTextColor(rgb.r * 255, rgb.g * 255, rgb.b * 255);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN PROFESIONAL', 20, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    const splitResumen = doc.splitTextToSize(data.resumen, 170);
    doc.text(splitResumen, 20, yPos);
    yPos += splitResumen.length * 5 + 5;
  }
  
  // Experiencia laboral
  if (data.experiencia && data.experiencia.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(rgb.r * 255, rgb.g * 255, rgb.b * 255);
    doc.setFont('helvetica', 'bold');
    doc.text('EXPERIENCIA LABORAL', 20, yPos);
    yPos += 8;
    
    data.experiencia.forEach(exp => {
      if (!exp.puesto && !exp.empresa) return;
      
      const jobTitle = exp.puesto || 'Puesto no especificado';
      const company = exp.empresa || 'Empresa no especificada';
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text(`${jobTitle} - ${company}`, 20, yPos);
      yPos += 6;
      
      // Fechas
      let dateText = '';
      if (exp.fecha_inicio) {
        dateText += exp.fecha_inicio.replace(/-/g, '/');
      }
      if (exp.fecha_fin) {
        dateText += ` - ${exp.fecha_fin.replace(/-/g, '/')}`;
      } else if (exp.fecha_inicio) {
        dateText += ' - Presente';
      }
      
      if (dateText) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text(dateText, 20, yPos);
        yPos += 6;
      }
      
      // Descripción
      if (exp.descripcion) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const splitDesc = doc.splitTextToSize(exp.descripcion, 170);
        doc.text(splitDesc, 20, yPos);
        yPos += splitDesc.length * 5 + 5;
      } else {
        yPos += 3;
      }
    });
    
    yPos += 5;
  }
  
  // Si la posición Y es mayor al tamaño de una página, añadir una nueva
  if (yPos > 270) {
    doc.addPage();
    yPos = 20;
  }
  
  // Educación
  if (data.educacion && data.educacion.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(rgb.r * 255, rgb.g * 255, rgb.b * 255);
    doc.setFont('helvetica', 'bold');
    doc.text('EDUCACIÓN', 20, yPos);
    yPos += 8;
    
    data.educacion.forEach(edu => {
      if (!edu.titulo && !edu.institucion) return;
      
      const degree = edu.titulo || 'Título no especificado';
      const institution = edu.institucion || 'Institución no especificada';
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text(`${degree} - ${institution}`, 20, yPos);
      yPos += 6;
      
      // Fechas
      let dateText = '';
      if (edu.fecha_inicio) {
        dateText += edu.fecha_inicio.replace(/-/g, '/');
      }
      if (edu.fecha_fin) {
        dateText += ` - ${edu.fecha_fin.replace(/-/g, '/')}`;
      }
      
      if (dateText) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text(dateText, 20, yPos);
        yPos += 6;
      }
      
      // Descripción
      if (edu.descripcion) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const splitDesc = doc.splitTextToSize(edu.descripcion, 170);
        doc.text(splitDesc, 20, yPos);
        yPos += splitDesc.length * 5 + 5;
      } else {
        yPos += 3;
      }
    });
    
    yPos += 5;
  }
  
  // Si la posición Y es mayor al tamaño de una página, añadir una nueva
  if (yPos > 270) {
    doc.addPage();
    yPos = 20;
  }
  
  // Habilidades
  if (data.habilidades && data.habilidades.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(rgb.r * 255, rgb.g * 255, rgb.b * 255);
    doc.setFont('helvetica', 'bold');
    doc.text('HABILIDADES', 20, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    const skillsText = data.habilidades.join(', ');
    const splitSkills = doc.splitTextToSize(skillsText, 170);
    doc.text(splitSkills, 20, yPos);
    yPos += splitSkills.length * 5 + 5;
  }
  
  // Si la posición Y es mayor al tamaño de una página, añadir una nueva
  if (yPos > 270) {
    doc.addPage();
    yPos = 20;
  }
  
  // Idiomas
  if (data.idiomas && data.idiomas.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(rgb.r * 255, rgb.g * 255, rgb.b * 255);
    doc.setFont('helvetica', 'bold');
    doc.text('IDIOMAS', 20, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    data.idiomas.forEach(idioma => {
      if (idioma.idioma && idioma.nivel) {
        doc.text(`${idioma.idioma}: ${idioma.nivel}`, 20, yPos);
        yPos += 5;
      }
    });
  }
  
  // Guardar el PDF
  const filePath = path.join(outputDir, filename);
  fs.writeFileSync(filePath, doc.output());
  return filePath;
}

// Función para generar CV con estilo moderno
function generateModernCv(data, filename) {
  // Crear un nuevo documento PDF
  const doc = new jsPDF();
  
  // Obtener color principal o usar uno predeterminado
  const colorPrincipal = data.color_principal || '#2c3e50';
  // Convertir HEX a componentes RGB (0-1)
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : { r: 0.17, g: 0.24, b: 0.31 }; // Color predeterminado si hay error
  };
  
  const rgb = hexToRgb(colorPrincipal);
  
  // Crear encabezado con fondo de color
  doc.setFillColor(rgb.r * 255, rgb.g * 255, rgb.b * 255);
  doc.rect(0, 0, 210, 30, 'F');
  
  // Nombre en el encabezado
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  const nombreWidth = doc.getTextWidth(data.nombre || '');
  doc.text(data.nombre || '', 105 - (nombreWidth / 2), 15);
  
  // Profesión
  if (data.profesion) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const profesionWidth = doc.getTextWidth(data.profesion);
    doc.text(data.profesion, 105 - (profesionWidth / 2), 22);
  }
  
  // División en dos columnas
  const leftColX = 20;
  const leftColWidth = 50;
  const rightColX = 80;
  const rightColWidth = 110;
  let leftColY = 40;
  let rightColY = 40;
  
  // Columna izquierda: Contacto, Habilidades, Idiomas
  
  // Sección de contacto
  doc.setFillColor(rgb.r * 255, rgb.g * 255, rgb.b * 255);
  doc.rect(leftColX - 2, leftColY - 5, leftColWidth + 4, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('CONTACTO', leftColX, leftColY);
  leftColY += 8;
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  
  if (data.email) {
    doc.setFont('helvetica', 'bold');
    doc.text('Email', leftColX, leftColY);
    leftColY += 5;
    doc.setFont('helvetica', 'normal');
    const splitEmail = doc.splitTextToSize(data.email, leftColWidth);
    doc.text(splitEmail, leftColX, leftColY);
    leftColY += splitEmail.length * 5 + 2;
  }
  
  if (data.telefono) {
    doc.setFont('helvetica', 'bold');
    doc.text('Teléfono', leftColX, leftColY);
    leftColY += 5;
    doc.setFont('helvetica', 'normal');
    doc.text(data.telefono, leftColX, leftColY);
    leftColY += 7;
  }
  
  if (data.direccion) {
    doc.setFont('helvetica', 'bold');
    doc.text('Dirección', leftColX, leftColY);
    leftColY += 5;
    doc.setFont('helvetica', 'normal');
    const splitDireccion = doc.splitTextToSize(data.direccion, leftColWidth);
    doc.text(splitDireccion, leftColX, leftColY);
    leftColY += splitDireccion.length * 5 + 2;
  }
  
  if (data.linkedin) {
    doc.setFont('helvetica', 'bold');
    doc.text('LinkedIn', leftColX, leftColY);
    leftColY += 5;
    doc.setFont('helvetica', 'normal');
    const splitLinkedin = doc.splitTextToSize(data.linkedin, leftColWidth);
    doc.text(splitLinkedin, leftColX, leftColY);
    leftColY += splitLinkedin.length * 5 + 2;
  }
  
  if (data.sitio_web) {
    doc.setFont('helvetica', 'bold');
    doc.text('Sitio Web', leftColX, leftColY);
    leftColY += 5;
    doc.setFont('helvetica', 'normal');
    const splitWeb = doc.splitTextToSize(data.sitio_web, leftColWidth);
    doc.text(splitWeb, leftColX, leftColY);
    leftColY += splitWeb.length * 5 + 2;
  }
  
  leftColY += 5;
  
  // Sección de habilidades
  if (data.habilidades && data.habilidades.length > 0) {
    doc.setFillColor(rgb.r * 255, rgb.g * 255, rgb.b * 255);
    doc.rect(leftColX - 2, leftColY - 5, leftColWidth + 4, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('HABILIDADES', leftColX, leftColY);
    leftColY += 8;
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    data.habilidades.forEach(skill => {
      doc.text('• ' + skill, leftColX, leftColY);
      leftColY += 5;
    });
    
    leftColY += 5;
  }
  
  // Sección de idiomas
  if (data.idiomas && data.idiomas.length > 0) {
    doc.setFillColor(rgb.r * 255, rgb.g * 255, rgb.b * 255);
    doc.rect(leftColX - 2, leftColY - 5, leftColWidth + 4, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('IDIOMAS', leftColX, leftColY);
    leftColY += 8;
    
    doc.setTextColor(0, 0, 0);
    
    data.idiomas.forEach(idioma => {
      if (idioma.idioma && idioma.nivel) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(idioma.idioma, leftColX, leftColY);
        leftColY += 5;
        
        doc.setFont('helvetica', 'normal');
        doc.text(idioma.nivel, leftColX, leftColY);
        leftColY += 6;
      }
    });
  }
  
  // Columna derecha: Perfil, Experiencia, Educación
  
  // Perfil profesional
  if (data.resumen) {
    doc.setFillColor(rgb.r * 255, rgb.g * 255, rgb.b * 255);
    doc.rect(rightColX - 2, rightColY - 5, rightColWidth + 4, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PERFIL PROFESIONAL', rightColX, rightColY);
    rightColY += 8;
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    const splitResumen = doc.splitTextToSize(data.resumen, rightColWidth);
    doc.text(splitResumen, rightColX, rightColY);
    rightColY += splitResumen.length * 5 + 8;
  }
  
  // Experiencia laboral
  if (data.experiencia && data.experiencia.length > 0) {
    doc.setFillColor(rgb.r * 255, rgb.g * 255, rgb.b * 255);
    doc.rect(rightColX - 2, rightColY - 5, rightColWidth + 4, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('EXPERIENCIA LABORAL', rightColX, rightColY);
    rightColY += 8;
    
    data.experiencia.forEach(exp => {
      if (!exp.puesto && !exp.empresa) return;
      
      const puesto = exp.puesto || 'Puesto no especificado';
      const empresa = exp.empresa || 'Empresa no especificada';
      
      // Si no hay suficiente espacio en la página, añadir una nueva
      if (rightColY > 270) {
        doc.addPage();
        rightColY = 20;
      }
      
      doc.setTextColor(rgb.r * 255, rgb.g * 255, rgb.b * 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(puesto, rightColX, rightColY);
      rightColY += 6;
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(empresa, rightColX, rightColY);
      rightColY += 5;
      
      // Fechas
      let dateText = '';
      if (exp.fecha_inicio) {
        dateText += exp.fecha_inicio.replace(/-/g, '/');
      }
      if (exp.fecha_fin) {
        dateText += ` - ${exp.fecha_fin.replace(/-/g, '/')}`;
      } else if (exp.fecha_inicio) {
        dateText += ' - Presente';
      }
      
      if (dateText) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.text(dateText, rightColX, rightColY);
        rightColY += 5;
      }
      
      // Descripción
      if (exp.descripcion) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const splitDesc = doc.splitTextToSize(exp.descripcion, rightColWidth);
        doc.text(splitDesc, rightColX, rightColY);
        rightColY += splitDesc.length * 5 + 5;
      } else {
        rightColY += 3;
      }
    });
    
    rightColY += 5;
  }
  
  // Si no hay suficiente espacio en la página, añadir una nueva
  if (rightColY > 270) {
    doc.addPage();
    rightColY = 20;
  }
  
  // Educación
  if (data.educacion && data.educacion.length > 0) {
    doc.setFillColor(rgb.r * 255, rgb.g * 255, rgb.b * 255);
    doc.rect(rightColX - 2, rightColY - 5, rightColWidth + 4, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('EDUCACIÓN', rightColX, rightColY);
    rightColY += 8;
    
    data.educacion.forEach(edu => {
      if (!edu.titulo && !edu.institucion) return;
      
      const titulo = edu.titulo || 'Título no especificado';
      const institucion = edu.institucion || 'Institución no especificada';
      
      // Si no hay suficiente espacio en la página, añadir una nueva
      if (rightColY > 270) {
        doc.addPage();
        rightColY = 20;
      }
      
      doc.setTextColor(rgb.r * 255, rgb.g * 255, rgb.b * 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(titulo, rightColX, rightColY);
      rightColY += 6;
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(institucion, rightColX, rightColY);
      rightColY += 5;
      
      // Fechas
      let dateText = '';
      if (edu.fecha_inicio) {
        dateText += edu.fecha_inicio.replace(/-/g, '/');
      }
      if (edu.fecha_fin) {
        dateText += ` - ${edu.fecha_fin.replace(/-/g, '/')}`;
      }
      
      if (dateText) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.text(dateText, rightColX, rightColY);
        rightColY += 5;
      }
      
      // Descripción
      if (edu.descripcion) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const splitDesc = doc.splitTextToSize(edu.descripcion, rightColWidth);
        doc.text(splitDesc, rightColX, rightColY);
        rightColY += splitDesc.length * 5 + 5;
      } else {
        rightColY += 3;
      }
    });
  }
  
  // Guardar el PDF
  const filePath = path.join(outputDir, filename);
  fs.writeFileSync(filePath, doc.output());
  return filePath;
}

// Ruta para generar PDF
app.post('/generar-pdf', (req, res) => {
  try {
    const data = req.body;
    
    // Validar datos
    const errors = validateData(data);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    
    // Sanitizar datos para evitar inyección
    Object.keys(data).forEach(key => {
      if (typeof data[key] === 'string') {
        data[key] = data[key].trim();
      }
    });
    
    // Generar nombre de archivo único
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
    const nombreArchivo = `cv_${data.nombre.toLowerCase().replace(/\s+/g, '_')}_${timestamp}.pdf`;
    
    // Seleccionar plantilla y generar PDF
    let rutaArchivo;
    if (data.plantilla === 'moderno') {
      rutaArchivo = generateModernCv(data, nombreArchivo);
    } else {
      // Por defecto, usar plantilla ATS
      rutaArchivo = generateAtsCv(data, nombreArchivo);
    }
    
    // Devolver la URL para descargar el PDF
    res.json({
      success: true,
      message: 'CV generado correctamente',
      pdf_url: `/${nombreArchivo}`
    });
  } catch (error) {
    console.error('Error al generar PDF:', error);
    res.status(500).json({ error: error.message });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
}); 