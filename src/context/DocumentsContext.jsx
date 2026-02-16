import { createContext, useContext, useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

const DocumentsContext = createContext();

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Convertir ArrayBuffer a Base64
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

  // Subir documento con múltiples hojas
  const uploadDocument = (clientId, month, file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target.result;
          const base64Data = arrayBufferToBase64(arrayBuffer);
          
          // Leer todas las hojas del workbook
          const data = new Uint8Array(arrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          const allSheets = {};
          workbook.SheetNames.forEach(sheetName => {
            const sheet = workbook.Sheets[sheetName];
            allSheets[sheetName] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          });
          
          // La primera hoja es la editable
          const firstSheetName = workbook.SheetNames[0];
          const firstSheetData = allSheets[firstSheetName];
          
          setClientDocuments(prev => ({
            ...prev,
            [clientId]: {
              ...prev[clientId],
              [month]: {
                name: file.name,
                originalFile: base64Data,
                sheets: allSheets, // Todas las hojas
                sheetNames: workbook.SheetNames,
                headers: firstSheetData[0] || [],
                data: firstSheetData, // Primera hoja para edición
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

  // Obtener datos de ambas hojas
  const getMergedData = (clientId, month) => {
    const doc = clientDocuments[clientId]?.[month];
    if (!doc) return null;

    const key = `${clientId}-${month}`;
    const clientData = completedData[key] || {};

    // Fusionar datos editados en la primera hoja
    const mergedFirstSheet = doc.data.map((row, rowIndex) => {
      return row.map((cell, colIndex) => {
        const cellKey = `${rowIndex}-${colIndex}`;
        return clientData[cellKey] !== undefined ? clientData[cellKey] : cell;
      });
    });

    return {
      headers: doc.headers,
      data: mergedFirstSheet,
      sheets: doc.sheets, // Todas las hojas
      sheetNames: doc.sheetNames,
      headersBySheet: Object.fromEntries(
        Object.entries(doc.sheets).map(([name, data]) => [name, data[0] || []])
      )
    };
  };

  // Actualizar datos completados
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

  // Eliminar documento
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
