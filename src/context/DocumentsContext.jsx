import { createContext, useContext, useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

const DocumentsContext = createContext();

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function DocumentsProvider({ children }) {
  // Estructura: { clienteId: { mes: { documento } } }
  const [clientDocuments, setClientDocuments] = useState({});
  const [completedData, setCompletedData] = useState({});
  const [currentMonth, setCurrentMonth] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState(null);

  // Cargar documentos y datos guardados al iniciar
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

  // Guardar cambios en localStorage
  useEffect(() => {
    localStorage.setItem('clientDocuments', JSON.stringify(clientDocuments));
  }, [clientDocuments]);

  useEffect(() => {
    localStorage.setItem('completedData', JSON.stringify(completedData));
  }, [completedData]);

  // Subir documento para un cliente y mes específico
  const uploadDocument = (clientId, month, file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          
          setClientDocuments(prev => ({
            ...prev,
            [clientId]: {
              ...prev[clientId],
              [month]: {
                name: file.name,
                data: jsonData,
                headers: jsonData[0] || [],
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
      data: merged
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

  // Verificar si un cliente tiene documento para un mes
  const hasDocument = (clientId, month) => {
    return !!clientDocuments[clientId]?.[month];
  };

  // Obtener meses disponibles para un cliente
  const getAvailableMonths = (clientId) => {
    if (!clientId || !clientDocuments[clientId]) return [];
    return MESES.filter(month => hasDocument(clientId, month));
  };

  // Obtener todos los documentos de un cliente
  const getClientDocuments = (clientId) => {
    return clientDocuments[clientId] || {};
  };

  // Obtener todos los clientes que tienen documentos
  const getClientsWithDocuments = () => {
    return Object.keys(clientDocuments);
  };

  // Verificar si un cliente tiene algún documento
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
