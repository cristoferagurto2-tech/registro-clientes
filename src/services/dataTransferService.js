// Servicio para exportar e importar datos
export const exportAllData = () => {
  try {
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      clients: JSON.parse(localStorage.getItem('clients') || '[]'),
      clientDocuments: JSON.parse(localStorage.getItem('clientDocuments') || '{}'),
      allowedEmails: JSON.parse(localStorage.getItem('allowedEmails') || '[]'),
      resetCodes: JSON.parse(localStorage.getItem('resetCodes') || '{}'),
      pdfBackups: {},
      settings: {
        pdfHeaderColor: JSON.parse(localStorage.getItem('pdfHeaderColor') || '[22, 163, 74]')
      }
    };

    // Obtener todos los backups de PDFs
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('pdf_backup_')) {
        data.pdfBackups[key] = JSON.parse(localStorage.getItem(key));
      }
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ClientCode_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, message: 'Datos exportados correctamente' };
  } catch (error) {
    console.error('Error al exportar:', error);
    return { success: false, error: error.message };
  }
};

export const importAllData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Validar estructura
        if (!data.clients || !Array.isArray(data.clients)) {
          throw new Error('Archivo inválido: no contiene datos de clientes');
        }

        // Confirmar antes de sobrescribir
        if (!window.confirm(`¿Estás seguro de importar estos datos?\n\nEsta acción reemplazará:\n- ${data.clients.length} clientes\n- ${Object.keys(data.clientDocuments || {}).length} documentos de clientes\n- ${Object.keys(data.pdfBackups || {}).length} backups\n\nLos datos actuales se perderán.`)) {
          resolve({ success: false, cancelled: true });
          return;
        }

        // Importar datos
        localStorage.setItem('clients', JSON.stringify(data.clients));
        localStorage.setItem('clientDocuments', JSON.stringify(data.clientDocuments || {}));
        localStorage.setItem('allowedEmails', JSON.stringify(data.allowedEmails || []));
        localStorage.setItem('resetCodes', JSON.stringify(data.resetCodes || {}));
        
        if (data.settings?.pdfHeaderColor) {
          localStorage.setItem('pdfHeaderColor', JSON.stringify(data.settings.pdfHeaderColor));
        }

        // Importar backups de PDFs
        if (data.pdfBackups) {
          Object.entries(data.pdfBackups).forEach(([key, value]) => {
            localStorage.setItem(key, JSON.stringify(value));
          });
        }

        resolve({ 
          success: true, 
          message: `Importación completada:\n- ${data.clients.length} clientes importados\n- ${Object.keys(data.clientDocuments || {}).length} documentos importados`,
          data: {
            clientCount: data.clients.length,
            documentCount: Object.keys(data.clientDocuments || {}).length
          }
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };

    reader.readAsText(file);
  });
};
