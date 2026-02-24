import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useDocuments } from './DocumentsContext';
import * as XLSX from 'xlsx';

const BackupContext = createContext();

// Constantes
const BACKUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
const BACKUP_STORAGE_KEY = 'lastBackupTimestamp';
const BACKUP_SCHEDULE_KEY = 'backupScheduleEnabled';

export function BackupProvider({ children }) {
  const { user } = useAuth();
  const { clientDocuments, completedData, MESES } = useDocuments();
  
  const [lastBackup, setLastBackup] = useState(null);
  const [nextBackup, setNextBackup] = useState(null);
  const [isBackupEnabled, setIsBackupEnabled] = useState(true);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupHistory, setBackupHistory] = useState([]);
  
  const backupTimerRef = useRef(null);

  // Cargar configuración guardada
  useEffect(() => {
    const savedTimestamp = localStorage.getItem(BACKUP_STORAGE_KEY);
    const savedSchedule = localStorage.getItem(BACKUP_SCHEDULE_KEY);
    const savedHistory = localStorage.getItem('backupHistory');
    
    if (savedTimestamp) {
      const timestamp = parseInt(savedTimestamp);
      setLastBackup(new Date(timestamp));
      setNextBackup(new Date(timestamp + BACKUP_INTERVAL_MS));
    }
    
    if (savedSchedule !== null) {
      setIsBackupEnabled(savedSchedule === 'true');
    }
    
    if (savedHistory) {
      try {
        setBackupHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Error loading backup history:', e);
      }
    }
  }, []);

  // Guardar configuración
  useEffect(() => {
    localStorage.setItem(BACKUP_SCHEDULE_KEY, isBackupEnabled.toString());
  }, [isBackupEnabled]);

  // Guardar historial
  useEffect(() => {
    localStorage.setItem('backupHistory', JSON.stringify(backupHistory));
  }, [backupHistory]);

  // Función para crear backup completo
  const createBackup = useCallback(() => {
    const timestamp = new Date();
    const backupData = {
      metadata: {
        version: '1.0',
        timestamp: timestamp.toISOString(),
        userId: user?.id || 'unknown',
        userEmail: user?.email || 'unknown',
        userName: user?.name || 'unknown'
      },
      clients: JSON.parse(localStorage.getItem('clients') || '[]'),
      allowedEmails: JSON.parse(localStorage.getItem('allowedEmails') || '[]'),
      clientDocuments: clientDocuments,
      completedData: completedData,
      resetCodes: JSON.parse(localStorage.getItem('resetCodes') || '{}'),
      settings: {
        pdfHeaderColor: JSON.parse(localStorage.getItem('pdfHeaderColor') || '[22, 163, 74]')
      }
    };

    return backupData;
  }, [user, clientDocuments, completedData]);

  // Función para exportar a Excel
  const exportToExcel = useCallback((backupData) => {
    const workbook = XLSX.utils.book_new();
    
    // Hoja 1: Resumen
    const summaryData = [
      ['BACKUP - REGISTRO DE CLIENTES'],
      [''],
      ['Fecha de Backup:', new Date(backupData.metadata.timestamp).toLocaleString()],
      ['Usuario:', backupData.metadata.userName],
      ['Email:', backupData.metadata.userEmail],
      ['ID:', backupData.metadata.userId],
      [''],
      ['ESTADÍSTICAS'],
      ['Total de Clientes:', backupData.clients.length],
      ['Documentos:', Object.keys(backupData.clientDocuments).length],
      ['Registros completados:', Object.keys(backupData.completedData).length],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');

    // Hoja 2: Clientes
    if (backupData.clients.length > 0) {
      const clientsData = backupData.clients.map(client => ({
        ID: client.id,
        Nombre: client.name,
        Email: client.email,
        Registrado: client.registeredAt ? new Date(client.registeredAt).toLocaleDateString() : 'N/A',
        Suscrito: client.isSubscribed ? 'Sí' : 'No',
        'Fecha Suscripción': client.subscribedAt ? new Date(client.subscribedAt).toLocaleDateString() : 'N/A'
      }));
      const clientsSheet = XLSX.utils.json_to_sheet(clientsData);
      XLSX.utils.book_append_sheet(workbook, clientsSheet, 'Clientes');
    }

    // Hoja 3: Documentos por Cliente
    Object.entries(backupData.clientDocuments).forEach(([clientId, months]) => {
      Object.entries(months).forEach(([month, doc]) => {
        if (doc.data && doc.data.length > 0) {
          const sheetName = `${clientId.substring(0, 8)}_${month}`.substring(0, 31);
          
          // Combinar headers con datos
          const sheetData = [doc.headers || [], ...doc.data];
          const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
          
          XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        }
      });
    });

    return workbook;
  }, []);

  // Función para descargar backup
  const downloadBackup = useCallback(async (isAutomatic = false) => {
    if (isBackingUp) return;
    
    setIsBackingUp(true);
    
    try {
      // Crear datos del backup
      const backupData = createBackup();
      
      // Exportar a Excel
      const workbook = exportToExcel(backupData);
      
      // Generar nombre de archivo
      const timestamp = new Date();
      const dateStr = timestamp.toISOString().split('T')[0];
      const timeStr = timestamp.toTimeString().split(' ')[0].replace(/:/g, '-');
      const filename = `Backup_ClientCore_${dateStr}_${timeStr}.xlsx`;
      
      // Descargar archivo
      XLSX.writeFile(workbook, filename);
      
      // Actualizar estado
      setLastBackup(timestamp);
      setNextBackup(new Date(timestamp.getTime() + BACKUP_INTERVAL_MS));
      localStorage.setItem(BACKUP_STORAGE_KEY, timestamp.getTime().toString());
      
      // Agregar al historial
      const historyEntry = {
        id: Date.now().toString(),
        timestamp: timestamp.toISOString(),
        filename: filename,
        type: isAutomatic ? 'automático' : 'manual',
        size: 'Excel'
      };
      
      setBackupHistory(prev => [historyEntry, ...prev.slice(0, 49)]); // Mantener últimos 50
      
      // Mostrar notificación
      if (isAutomatic) {
        console.log(`✅ Backup automático completado: ${filename}`);
      }
      
      return { success: true, filename };
    } catch (error) {
      console.error('Error al crear backup:', error);
      return { success: false, error: error.message };
    } finally {
      setIsBackingUp(false);
    }
  }, [createBackup, exportToExcel, isBackingUp]);

  // Función para verificar y ejecutar backup automático
  const checkAndRunAutomaticBackup = useCallback(() => {
    if (!isBackupEnabled || !user) return;
    
    const now = Date.now();
    const savedTimestamp = localStorage.getItem(BACKUP_STORAGE_KEY);
    
    if (!savedTimestamp) {
      // Primera vez - crear backup inicial
      downloadBackup(true);
      return;
    }
    
    const lastBackupTime = parseInt(savedTimestamp);
    const timeSinceLastBackup = now - lastBackupTime;
    
    if (timeSinceLastBackup >= BACKUP_INTERVAL_MS) {
      // Han pasado 24 horas o más - crear backup
      downloadBackup(true);
    }
  }, [isBackupEnabled, user, downloadBackup]);

  // Configurar verificación periódica
  useEffect(() => {
    if (!user || !isBackupEnabled) return;
    
    // Verificar inmediatamente al iniciar sesión
    checkAndRunAutomaticBackup();
    
    // Verificar cada hora si es hora de hacer backup
    backupTimerRef.current = setInterval(() => {
      checkAndRunAutomaticBackup();
    }, 60 * 60 * 1000); // Cada hora
    
    return () => {
      if (backupTimerRef.current) {
        clearInterval(backupTimerRef.current);
      }
    };
  }, [user, isBackupEnabled, checkAndRunAutomaticBackup]);

  // Función para backup manual
  const triggerManualBackup = useCallback(async () => {
    return await downloadBackup(false);
  }, [downloadBackup]);

  // Función para alternar backup automático
  const toggleBackupSchedule = useCallback(() => {
    setIsBackupEnabled(prev => !prev);
  }, []);

  // Función para restaurar desde backup
  const restoreFromBackup = useCallback(async (file) => {
    try {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Aquí puedes implementar la lógica de restauración
            // Por ahora solo mostramos información
            const sheetNames = workbook.SheetNames;
            
            resolve({
              success: true,
              message: `Backup cargado con ${sheetNames.length} hojas`,
              sheets: sheetNames
            });
          } catch (error) {
            reject(error);
          }
        };
        
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });
    } catch (error) {
      console.error('Error al restaurar backup:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Calcular tiempo restante para el próximo backup
  const getTimeUntilNextBackup = useCallback(() => {
    if (!nextBackup) return null;
    
    const now = Date.now();
    const nextTime = nextBackup.getTime();
    const diff = nextTime - now;
    
    if (diff <= 0) return 'Ahora';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  }, [nextBackup]);

  const value = {
    lastBackup,
    nextBackup,
    isBackupEnabled,
    isBackingUp,
    backupHistory,
    timeUntilNextBackup: getTimeUntilNextBackup(),
    triggerManualBackup,
    toggleBackupSchedule,
    restoreFromBackup,
    createBackup,
    downloadBackup
  };

  return (
    <BackupContext.Provider value={value}>
      {children}
    </BackupContext.Provider>
  );
}

export function useBackup() {
  const context = useContext(BackupContext);
  if (!context) {
    throw new Error('useBackup debe usarse dentro de BackupProvider');
  }
  return context;
}
