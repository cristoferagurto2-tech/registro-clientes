import { createContext, useContext, useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

const DocumentsContext = createContext();

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Convertir ArrayBuffer a Base64 para guardar en localStorage
const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

// Convertir Base64 a ArrayBuffer
const base64ToArrayBuffer = (base64) => {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

export function DocumentsProvider({ children }) {
  const [clientDocuments, setClientDocuments] = useState({});
  const [completedData, setCompletedData] = useState({});
  const [currentMonth, setCurrentMonth] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState(null);

  useEffect(() => {
    const savedDocs = localStorage.getItem('clientDocuments');
    const savedData = localStorage.getItem('completedData');
    
    if (savedDocs) {
      setClientDocuments(JSON.parse(savedDocs));
    }
    if (savedData) {
      setCompletedData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('clientDocuments', JSON.stringify(clientDocuments));
  }, [clientDocuments]);

  useEffect(() => {
    localStorage.setItem('completedData', JSON.stringify(completedData));
  }, [completedData]);

  // Subir documento completo (guarda el archivo Excel original)
  const uploadDocument = (clientId, month, file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target.result;
          const base64Data = arrayBufferToBase64(arrayBuffer);
          
          // Leer el workbook para obtener datos de la primera hoja (para edición web)
          const data = new Uint8Array(arrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          
          setClientDocuments(prev => ({
            ...prev,
            [clientId]: {
              ...prev[clientId],
              [month]: {
                name: file.name,
                originalFile: base64Data, // Archivo Excel completo en Base64
                data: jsonData, // Datos de primera hoja para edición web
                headers: jsonData[0] || [],
                sheetNames: workbook.SheetNames, // Nombres de todas las hojas
                uploadedAt: new Date().toISOString(),
                clientId: clientId
              }
            }
          }));
          
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  // Descargar archivo Excel original completo (con todas las hojas y fórmulas)
  const downloadOriginalFile = (clientId, month) => {
    const doc = clientDocuments[clientId]?.[month];
    if (!doc || !doc.originalFile) return;

    try {
      // Convertir Base64 a ArrayBuffer
      const arrayBuffer = base64ToArrayBuffer(doc.originalFile);
      
      // Crear blob y descargar
      const blob = new Blob([arrayBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name || `${month}_2025.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Error al descargar archivo:', error);
      return false;
    }
  };

  // Actualizar datos completados por un cliente
  const updateCompletedData = (clientId, month, rowIndex, columnIndex, value) => {
    const key = `${clientId}-${month}`;
    setCompletedData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [`${rowIndex}-${columnIndex}`]: value
      }
    }));
  };

  // Obtener datos fusionados para un cliente y mes
  const getMergedData = (clientId, month) => {
    const doc = clientDocuments[clientId]?.[month];
    if (!doc) return null;

    const key = `${clientId}-${month}`;
    const clientData = completedData[key] || {};

    const merged = doc.data.map((row, rowIndex) => {
      return row.map((cell, colIndex) => {
        const cellKey = `${rowIndex}-${colIndex}`;
        return clientData[cellKey] !== undefined ? clientData[cellKey] : cell;
      });
    });

    return {
      headers: doc.headers,
      data: merged,
      sheetNames: doc.sheetNames || []
    };
  };

  // Eliminar documento de un cliente
  const deleteDocument = (clientId, month) => {
    setClientDocuments(prev => {
      const newDocs = { ...prev };
      if (newDocs[clientId]) {
        delete newDocs[clientId][month];
        if (Object.keys(newDocs[clientId]).length === 0) {
          delete newDocs[clientId];
        }
      }
      return newDocs;
    });
    
    const key = `${clientId}-${month}`;
    setCompletedData(prev => {
      const newData = { ...prev };
      delete newData[key];
      return newData;
    });
  };

  const hasDocument = (clientId, month) => {
    return !!clientDocuments[clientId]?.[month];
  };

  const getAvailableMonths = (clientId) => {
    if (!clientId || !clientDocuments[clientId]) return [];
    return MESES.filter(month => hasDocument(clientId, month));
  };

  const getClientDocuments = (clientId) => {
    return clientDocuments[clientId] || {};
  };

  const getClientsWithDocuments = () => {
    return Object.keys(clientDocuments);
  };

  const clientHasAnyDocument = (clientId) => {
    return Object.keys(clientDocuments[clientId] || {}).length > 0;
  };

  return (
    <DocumentsContext.Provider value={{
      MESES,
      clientDocuments,
      completedData,
      currentMonth,
      setCurrentMonth,
      selectedClientId,
      setSelectedClientId,
      uploadDocument,
      downloadOriginalFile,
      updateCompletedData,
      getMergedData,
      deleteDocument,
      hasDocument,
      getAvailableMonths,
      getClientDocuments,
      getClientsWithDocuments,
      clientHasAnyDocument
    }}>
      {children}
    </DocumentsContext.Provider>
  );
}

export function useDocuments() {
  const context = useContext(DocumentsContext);
  if (!context) {
    throw new Error('useDocuments debe usarse dentro de DocumentsProvider');
  }
  return context;
}
