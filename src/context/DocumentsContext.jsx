import { createContext, useContext, useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

const DocumentsContext = createContext();

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function DocumentsProvider({ children }) {
  const [documents, setDocuments] = useState({});
  const [completedData, setCompletedData] = useState({});
  const [currentMonth, setCurrentMonth] = useState(null);

  // Cargar documentos y datos guardados al iniciar
  useEffect(() => {
    const savedDocs = localStorage.getItem('documents');
    const savedData = localStorage.getItem('completedData');
    
    if (savedDocs) {
      setDocuments(JSON.parse(savedDocs));
    }
    if (savedData) {
      setCompletedData(JSON.parse(savedData));
    }
  }, []);

  // Guardar cambios en localStorage
  useEffect(() => {
    localStorage.setItem('documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('completedData', JSON.stringify(completedData));
  }, [completedData]);

  // Subir documento para un mes específico
  const uploadDocument = (month, file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Convertir workbook a JSON para almacenar
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          
          setDocuments(prev => ({
            ...prev,
            [month]: {
              name: file.name,
              data: jsonData,
              headers: jsonData[0] || [],
              uploadedAt: new Date().toISOString()
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

  // Actualizar datos completados por los clientes
  const updateCompletedData = (month, rowIndex, columnIndex, value) => {
    setCompletedData(prev => ({
      ...prev,
      [month]: {
        ...prev[month],
        [`${rowIndex}-${columnIndex}`]: value
      }
    }));
  };

  // Obtener datos fusionados (documento original + datos completados)
  const getMergedData = (month) => {
    const doc = documents[month];
    if (!doc) return null;

    const merged = doc.data.map((row, rowIndex) => {
      return row.map((cell, colIndex) => {
        const key = `${rowIndex}-${colIndex}`;
        return completedData[month]?.[key] !== undefined 
          ? completedData[month][key] 
          : cell;
      });
    });

    return {
      headers: doc.headers,
      data: merged
    };
  };

  // Eliminar documento
  const deleteDocument = (month) => {
    setDocuments(prev => {
      const newDocs = { ...prev };
      delete newDocs[month];
      return newDocs;
    });
    
    setCompletedData(prev => {
      const newData = { ...prev };
      delete newData[month];
      return newData;
    });
  };

  // Verificar si un mes tiene documento
  const hasDocument = (month) => {
    return !!documents[month];
  };

  // Obtener lista de meses con documentos
  const getAvailableMonths = () => {
    return MESES.filter(month => hasDocument(month));
  };

  return (
    <DocumentsContext.Provider value={{
      MESES,
      documents,
      completedData,
      currentMonth,
      setCurrentMonth,
      uploadDocument,
      updateCompletedData,
      getMergedData,
      deleteDocument,
      hasDocument,
      getAvailableMonths
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
