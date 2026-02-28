// Servicio para manejar el almacenamiento de PDFs de backup
const PDF_BACKUP_PREFIX = 'pdf_backup_';
const MAX_PDF_BACKUPS = 12; // Máximo 12 meses

/**
 * Guarda un PDF de backup en localStorage
 * @param {string} userId - ID del usuario
 * @param {string} month - Nombre del mes (ej: 'Enero')
 * @param {number} year - Año (ej: 2026)
 * @param {string} pdfBase64 - PDF en formato base64
 * @param {object} metadata - Metadata del backup
 */
export const savePDFBackup = (userId, month, year, pdfBase64, metadata) => {
  try {
    const key = `${PDF_BACKUP_PREFIX}${userId}_${month}_${year}`;
    
    const backupData = {
      pdfData: pdfBase64,
      metadata: {
        month,
        year,
        savedAt: new Date().toISOString(),
        status: 'completado',
        ...metadata
      }
    };
    
    // Verificar si ya existe para no duplicar
    const existing = localStorage.getItem(key);
    if (existing) {
      console.log(`Actualizando backup existente: ${month} ${year}`);
    }
    
    // Guardar en localStorage
    localStorage.setItem(key, JSON.stringify(backupData));
    
    // Limpiar backups antiguos si hay más de 12
    cleanupOldBackups(userId);
    
    return { success: true, key };
  } catch (error) {
    console.error('Error al guardar PDF backup:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Obtiene un PDF de backup específico
 * @param {string} userId - ID del usuario
 * @param {string} month - Nombre del mes
 * @param {number} year - Año
 * @returns {object|null} Datos del backup o null si no existe
 */
export const getPDFBackup = (userId, month, year) => {
  try {
    const key = `${PDF_BACKUP_PREFIX}${userId}_${month}_${year}`;
    const data = localStorage.getItem(key);
    
    if (!data) return null;
    
    return JSON.parse(data);
  } catch (error) {
    console.error('Error al obtener PDF backup:', error);
    return null;
  }
};

/**
 * Obtiene todos los PDFs de backup de un usuario
 * @param {string} userId - ID del usuario
 * @returns {array} Lista de backups ordenados por fecha (más reciente primero)
 */
export const getAllPDFBackups = (userId) => {
  try {
    const backups = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (key && key.startsWith(`${PDF_BACKUP_PREFIX}${userId}_`)) {
        const data = localStorage.getItem(key);
        if (data) {
          const backup = JSON.parse(data);
          backups.push({
            key,
            ...backup
          });
        }
      }
    }
    
    // Ordenar por fecha de guardado (más reciente primero)
    return backups.sort((a, b) => {
      return new Date(b.metadata.savedAt) - new Date(a.metadata.savedAt);
    });
  } catch (error) {
    console.error('Error al obtener todos los PDF backups:', error);
    return [];
  }
};

/**
 * Elimina un PDF de backup específico
 * @param {string} userId - ID del usuario
 * @param {string} month - Nombre del mes
 * @param {number} year - Año
 */
export const deletePDFBackup = (userId, month, year) => {
  try {
    const key = `${PDF_BACKUP_PREFIX}${userId}_${month}_${year}`;
    localStorage.removeItem(key);
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar PDF backup:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Verifica si existe un backup para un mes específico
 * @param {string} userId - ID del usuario
 * @param {string} month - Nombre del mes
 * @param {number} year - Año
 * @returns {boolean}
 */
export const hasPDFBackup = (userId, month, year) => {
  const key = `${PDF_BACKUP_PREFIX}${userId}_${month}_${year}`;
  return localStorage.getItem(key) !== null;
};

/**
 * Limpia backups antiguos manteniendo solo los últimos MAX_PDF_BACKUPS
 * @param {string} userId - ID del usuario
 */
const cleanupOldBackups = (userId) => {
  try {
    const backups = getAllPDFBackups(userId);
    
    if (backups.length > MAX_PDF_BACKUPS) {
      // Obtener los backups más antiguos (los últimos en la lista ya que está ordenada descendentemente)
      const backupsToDelete = backups.slice(MAX_PDF_BACKUPS);
      
      backupsToDelete.forEach(backup => {
        const { month, year } = backup.metadata;
        console.log(`Eliminando backup antiguo: ${month} ${year}`);
        deletePDFBackup(userId, month, year);
      });
    }
  } catch (error) {
    console.error('Error al limpiar backups antiguos:', error);
  }
};

/**
 * Obtiene el espacio utilizado en localStorage por los backups
 * @param {string} userId - ID del usuario
 * @returns {object} Información del espacio utilizado
 */
export const getBackupStorageInfo = (userId) => {
  try {
    const backups = getAllPDFBackups(userId);
    let totalSize = 0;
    
    backups.forEach(backup => {
      const key = `${PDF_BACKUP_PREFIX}${userId}_${backup.metadata.month}_${backup.metadata.year}`;
      const item = localStorage.getItem(key);
      if (item) {
        totalSize += item.length * 2; // Aproximadamente 2 bytes por caracter en UTF-16
      }
    });
    
    return {
      count: backups.length,
      totalSizeKB: Math.round(totalSize / 1024),
      maxBackups: MAX_PDF_BACKUPS
    };
  } catch (error) {
    console.error('Error al obtener info de almacenamiento:', error);
    return { count: 0, totalSizeKB: 0, maxBackups: MAX_PDF_BACKUPS };
  }
};
