import { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import './ImageScanner.css';

export default function ImageScanner({ onDataExtracted, onClose }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState('');
  const [parsedData, setParsedData] = useState([]); // Array para múltiples registros
  const fileInputRef = useRef(null);

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setExtractedText('');
      setParsedData([]);
    }
  };

  const processImage = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const result = await Tesseract.recognize(
        selectedImage,
        'spa', // Idioma español
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round(m.progress * 100));
            }
          }
        }
      );

      const text = result.data.text;
      setExtractedText(text);
      
      // Parsear los datos extraídos (ahora devuelve array)
      const records = parseExtractedData(text);
      setParsedData(records);
    } catch (error) {
      console.error('Error al procesar imagen:', error);
      alert('Error al procesar la imagen. Intenta con otra foto más clara.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Función auxiliar para crear registro vacío
  const createEmptyRecord = () => ({
    fecha: '',
    dni: '',
    nombre: '',
    celular: '',
    producto: '',
    monto: '',
    tasa: '',
    lugar: '',
    observacion: '',
    ganancias: ''
  });

  // Función auxiliar para validar si un registro tiene datos mínimos
  const isValidRecord = (record) => {
    return record.dni && record.dni.length === 8;
  };

  // Función mejorada para parsear múltiples registros
  const parseExtractedData = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const records = [];
    let currentRecord = createEmptyRecord();
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      const lowerLine = trimmedLine.toLowerCase();
      
      // DETECTAR NUEVO CLIENTE POR DNI (8 dígitos consecutivos)
      const dniMatch = trimmedLine.match(/\b\d{8}\b/);
      if (dniMatch) {
        // Si ya teníamos un DNI guardado, este es un nuevo cliente
        if (currentRecord.dni) {
          if (isValidRecord(currentRecord)) {
            records.push({ ...currentRecord });
          }
          // Iniciar nuevo registro
          currentRecord = createEmptyRecord();
        }
        currentRecord.dni = dniMatch[0];
      }
      
      // CELULAR (9 dígitos que empiecen con 9)
      const celMatch = trimmedLine.match(/\b(9\d{8})\b/);
      if (celMatch && !currentRecord.celular) {
        currentRecord.celular = celMatch[1];
      }
      
      // MONTO - Detectar después de S/ o cuando la columna diga "monto"
      // Prioridad 1: Buscar S/ seguido de número
      const montoConSimbolo = trimmedLine.match(/S\/?\.?\s*(\d[\d\.,]*)/i);
      if (montoConSimbolo && !currentRecord.monto) {
        const montoLimpio = montoConSimbolo[1].replace(/\./g, '').replace(',', '');
        if (montoLimpio.length >= 3) { // Evitar números pequeños que puedan ser fechas
          currentRecord.monto = montoLimpio;
        }
      }
      // Prioridad 2: Buscar en líneas que contengan "monto" como encabezado
      if (!currentRecord.monto && lowerLine.includes('monto')) {
        const montoEnLinea = trimmedLine.match(/(\d[\d\.,]*)/);
        if (montoEnLinea) {
          const montoLimpio = montoEnLinea[1].replace(/\./g, '').replace(',', '');
          if (montoLimpio.length >= 3) {
            currentRecord.monto = montoLimpio;
          }
        }
      }
      
      // TASA - Soportar decimales (0.1, 5.5, 10.25, etc.)
      const tasaMatch = trimmedLine.match(/(\d+(?:\.\d+)?)\s*%/);
      if (tasaMatch && !currentRecord.tasa) {
        currentRecord.tasa = tasaMatch[1];
      }
      
      // PRODUCTO - Nombres completos
      const productos = [
        { full: 'Préstamo Personal', keywords: ['préstamo personal', 'prestamo personal'] },
        { full: 'Crédito de Consumo', keywords: ['crédito de consumo', 'credito de consumo'] },
        { full: 'Tarjeta de Crédito', keywords: ['tarjeta de crédito', 'tarjeta de credito', 'tarjeta credito'] },
        { full: 'Préstamo Vehicular', keywords: ['préstamo vehicular', 'prestamo vehicular', 'vehicular'] },
        { full: 'Crédito Hipotecario', keywords: ['crédito hipotecario', 'credito hipotecario', 'hipotecario'] },
        { full: 'Microcrédito', keywords: ['microcrédito', 'microcredito'] }
      ];
      
      if (!currentRecord.producto) {
        for (const prod of productos) {
          if (prod.keywords.some(kw => lowerLine.includes(kw))) {
            currentRecord.producto = prod.full;
            break;
          }
        }
      }
      
      // NOMBRE - Solo letras y espacios, limpiar caracteres especiales
      // Validar que tenga solo letras, espacios y acentos
      const nombreSoloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{3,50}$/;
      const palabras = trimmedLine.split(/\s+/).filter(p => p.length > 0);
      
      if (palabras.length >= 2 && 
          palabras.length <= 6 && // Máximo 6 palabras
          !trimmedLine.match(/^\d/) && // No empieza con número
          !trimmedLine.includes('/') && // No tiene fecha
          !lowerLine.includes('s/') && // No es monto
          !lowerLine.includes('dni') && // No es etiqueta DNI
          !lowerLine.includes('monto') && // No es etiqueta monto
          nombreSoloLetras.test(trimmedLine.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '')) &&
          !currentRecord.nombre) {
        
        // Limpiar caracteres especiales
        let nombreLimpio = trimmedLine
          .replace(/^[\_\-\.\,\:\;\|\(\)\[\]\{\}\*\+\=\?\!\@\#\$\%\^\&\s]+/, '')
          .replace(/[\_\-\.\,\:\;\|\(\)\[\]\{\}\*\+\=\?\!\@\#\$\%\^\&\s]+$/, '');
        
        if (nombreLimpio.length >= 5) {
          currentRecord.nombre = nombreLimpio;
        }
      }
      
      // FECHA - Solo formato exacto DD/MM/AAAA
      const fechaMatch = trimmedLine.match(/\b(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d{2}\b/);
      if (fechaMatch && !currentRecord.fecha) {
        currentRecord.fecha = fechaMatch[0];
      }
      
      // LUGAR - Solo letras, detectado por encabezado o palabras comunes de ciudad
      const ciudadesComunes = ['lima', 'arequipa', 'trujillo', 'chiclayo', 'piura', 'cusco', 'callao', 
                               'ica', 'huancayo', 'pucallpa', 'iquitos', 'tacna', 'moquegua'];
      const lugarKeywords = ['lugar', 'distrito', 'provincia', 'departamento', 'ciudad'];
      
      if (!currentRecord.lugar) {
        // Opción 1: Detectar por encabezado "lugar" o similar
        if (lugarKeywords.some(kw => lowerLine.includes(kw))) {
          const palabrasLugar = trimmedLine.split(/\s+/);
          // Tomar las palabras después del encabezado
          const indiceKeyword = palabrasLugar.findIndex(p => 
            lugarKeywords.some(kw => p.toLowerCase().includes(kw))
          );
          if (indiceKeyword !== -1 && palabrasLugar.length > indiceKeyword + 1) {
            const posibleLugar = palabrasLugar.slice(indiceKeyword + 1).join(' ')
              .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
              .trim();
            if (posibleLugar.length >= 3 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(posibleLugar)) {
              currentRecord.lugar = posibleLugar;
            }
          }
        }
        
        // Opción 2: Detectar ciudad común suelta
        if (!currentRecord.lugar) {
          for (const ciudad of ciudadesComunes) {
            if (lowerLine === ciudad || lowerLine.includes(` ${ciudad} `)) {
              currentRecord.lugar = ciudad.charAt(0).toUpperCase() + ciudad.slice(1);
              break;
            }
          }
        }
      }
    });
    
    // Guardar el último registro si es válido
    if (isValidRecord(currentRecord)) {
      records.push(currentRecord);
    }
    
    // Limpiar y validar cada registro
    return records.filter(record => record.dni && record.dni.length === 8);
  };

  const handleApplyData = () => {
    if (parsedData && parsedData.length > 0) {
      onDataExtracted(parsedData); // Envía array de registros
      onClose();
    }
  };

  const handleRetake = () => {
    setSelectedImage(null);
    setExtractedText('');
    setParsedData([]);
    fileInputRef.current.value = '';
  };

  return (
    <div className="image-scanner-overlay" onClick={onClose}>
      <div className="image-scanner-modal" onClick={(e) => e.stopPropagation()}>
        <div className="scanner-header">
          <h3>📷 Escanear Documento</h3>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <div className="scanner-content">
          {!selectedImage ? (
            <div className="upload-section">
              <div className="upload-icon">📸</div>
              <p className="upload-text">
                Sube una foto clara de la hoja de datos del cliente
              </p>
              <p className="upload-hint">
                Asegúrate de que se vean bien: DNI, nombre, monto y producto
              </p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                capture="environment"
                className="file-input"
              />
              <button 
                className="btn-select-image"
                onClick={() => fileInputRef.current?.click()}
              >
                📁 Seleccionar Imagen
              </button>
            </div>
          ) : (
            <div className="preview-section">
              <div className="image-preview">
                <img src={selectedImage} alt="Documento" />
              </div>
              
              {!extractedText && !isProcessing && (
                <div className="action-buttons">
                  <button 
                    className="btn-process"
                    onClick={processImage}
                  >
                    🔍 Procesar Imagen
                  </button>
                  <button 
                    className="btn-retake"
                    onClick={handleRetake}
                  >
                    📷 Tomar Otra
                  </button>
                </div>
              )}

              {isProcessing && (
                <div className="processing-status">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p>Procesando... {progress}%</p>
                </div>
              )}

              {extractedText && parsedData && (
                <div className="results-section">
                  <div className="results-header">
                    <h4>📋 Datos Detectados</h4>
                    {parsedData.length > 0 && (
                      <span className="client-count">{parsedData.length} cliente(s)</span>
                    )}
                  </div>
                  
                  {parsedData.length > 0 ? (
                    <div className="records-preview">
                      {parsedData.map((record, index) => (
                        <div key={index} className="record-card">
                          <div className="record-header">
                            <span className="record-number">#{index + 1}</span>
                            <span className="record-name">{record.nombre || 'Sin nombre'}</span>
                          </div>
                          
                          <div className="record-fields">
                            {record.dni && (
                              <div className="field"><span className="label">DNI:</span> {record.dni}</div>
                            )}
                            {record.celular && (
                              <div className="field"><span className="label">Cel:</span> {record.celular}</div>
                            )}
                            {record.monto && (
                              <div className="field"><span className="label">Monto:</span> S/ {record.monto}</div>
                            )}
                            {record.tasa && (
                              <div className="field"><span className="label">Tasa:</span> {record.tasa}%</div>
                            )}
                            {record.producto && (
                              <div className="field"><span className="label">Prod:</span> {record.producto}</div>
                            )}
                            {record.lugar && (
                              <div className="field"><span className="label">Lugar:</span> {record.lugar}</div>
                            )}
                            {record.fecha && (
                              <div className="field"><span className="label">Fecha:</span> {record.fecha}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-data-message">
                      <p>⚠️ No se detectaron clientes válidos en la imagen.</p>
                      <p>Intenta con una foto más clara donde se vean los DNI.</p>
                    </div>
                  )}
                  
                  <div className="extracted-text-preview">
                    <details>
                      <summary>Ver texto completo extraído</summary>
                      <pre>{extractedText}</pre>
                    </details>
                  </div>

                  <div className="action-buttons">
                    {parsedData.length > 0 && (
                      <button 
                        className="btn-apply"
                        onClick={handleApplyData}
                      >
                        ✅ Usar estos Datos ({parsedData.length} cliente(s))
                      </button>
                    )}
                    <button 
                      className="btn-retake"
                      onClick={handleRetake}
                    >
                      🔄 Intentar con Otra Foto
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="scanner-footer">
          <p className="footer-note">
            💡 Consejo: Usa buena iluminación y mantén la cámara estable para mejores resultados
          </p>
        </div>
      </div>
    </div>
  );
}
