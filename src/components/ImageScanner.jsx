import { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import './ImageScanner.css';

export default function ImageScanner({ onDataExtracted, onClose }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState('');
  const [parsedData, setParsedData] = useState([]);
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
      console.log('🔄 Iniciando OCR con configuración PSM 6...');
      
      const result = await Tesseract.recognize(
        selectedImage,
        'spa',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round(m.progress * 100));
            }
          },
          tessedit_pageseg_mode: '6',
          tessedit_ocr_engine_mode: '3'
        }
      );

      const text = result.data.text;
      console.log('✅ Texto extraído:', text.substring(0, 200) + '...');
      
      const records = parseExtractedData(text);
      console.log('📊 Registros detectados:', records.length);
      
      console.log('🎯 Resumen final:', {
        totalClientes: records.length,
        conNombre: records.filter(r => r.nombre).length,
        conMonto: records.filter(r => r.monto).length,
        conLugar: records.filter(r => r.lugar).length
      });
      
      setExtractedText(text);
      setParsedData(records);
    } catch (error) {
      console.error('❌ Error al procesar imagen:', error);
      alert('Error al procesar la imagen. Intenta con otra foto más clara.');
    } finally {
      setIsProcessing(false);
    }
  };

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

  const isValidRecord = (record) => {
    return record.dni && record.dni.length === 8;
  };

  const parseExtractedData = (text) => {
    const records = [];
    
    const productosMap = {
      'Préstamo Personal': ['préstamo personal', 'prestamo personal'],
      'Crédito de Consumo': ['crédito de consumo', 'credito de consumo'],
      'Tarjeta de Crédito': ['tarjeta de crédito', 'tarjeta de credito', 'tarjeta credito'],
      'Préstamo Vehicular': ['préstamo vehicular', 'prestamo vehicular', 'vehicular'],
      'Crédito Hipotecario': ['crédito hipotecario', 'credito hipotecario', 'hipotecario'],
      'Microcrédito': ['microcrédito', 'microcredito']
    };
    
    const estadosList = ['Pendiente', 'Cobro', 'En espera', 'Cancelado', 'Rechazado'];
    
    const ciudadesList = ['Lima', 'Arequipa', 'Trujillo', 'Chiclayo', 'Piura', 'Cusco', 
                          'Callao', 'Ica', 'Huancayo', 'Pucallpa', 'Iquitos', 'Tacna', 
                          'Moquegua', 'Olmos'];
    
    const correccionesNombres = {
      'Rominasanches': 'Romina Sanches',
      'Romina Sanches': 'Romina Sanches',
      'Mily Gonsaes': 'Mily Gonsales',
      'Mily Gonsales': 'Mily Gonsales',
      'Imily Gonsales': 'Mily Gonsales',
      'Imily Gonsaes': 'Mily Gonsales',
      'Rosario Seden': 'Rosario Seden',
      'Irosario Seden': 'Rosario Seden',
      'Rosario Sedeno': 'Rosario Seden',
      'Maria Lupez': 'Maria Lupez',
      'Imaria Lupez': 'Maria Lupez',
      'Imarialupez': 'Maria Lupez',
      'Josefa Musques': 'Josefa Musques',
      'Losefa Musques': 'Josefa Musques',
      'Alexander Santos': 'Alexander Santos',
      'Alexandersantos': 'Alexander Santos',
      'Pepe Rausol': 'Pepe Rausol',
      'Cristofer Vallejos': 'Cristofer Vallejos',
      'Cristofervallejos': 'Cristofer Vallejos'
    };
    
    const palabrasBasura = ['PN', 'PO', 'O', 'NON', 'NO', 'MK', 'LEE', 'Ex', 'Sr'];
    
    const limpiarNombre = (nombreDetectado) => {
      let limpio = nombreDetectado.replace(/^(I|IM|IN|IR|M)(?=[A-ZÁÉÍÓÚÑ])/i, '');
      
      limpio = limpio.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, ' ');
      limpio = limpio.replace(/\s+/g, ' ').trim();
      limpio = limpio.replace(/([a-záéíóúñ])([A-ZÁÉÍÓÚÑ])/g, '$1 $2');
      
      palabrasBasura.forEach(palabra => {
        const regex = new RegExp(`\\b${palabra}\\b`, 'gi');
        limpio = limpio.replace(regex, '');
      });
      
      limpio = limpio.replace(/^(I\s+|IM\s+|IN\s+|IR\s+|M\s+)/i, '');
      limpio = limpio.replace(/\s+/g, ' ').trim();
      
      if (correccionesNombres[limpio]) {
        return correccionesNombres[limpio];
      }
      
      limpio = limpio.replace(/\b\w/g, l => l.toUpperCase());
      
      return limpio;
    };
    
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    lines.forEach((line) => {
      if (line.match(/^(Fecha|Mes|DNI|Nombre|#)/i) || line.length < 20) {
        return;
      }
      
      const record = createEmptyRecord();
      
      const fechaMatch = line.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
      if (fechaMatch) {
        let dia = fechaMatch[1];
        let mes = fechaMatch[2];
        let anio = fechaMatch[3];
        
        if (anio === '2006') {
          anio = '2026';
        }
        
        record.fecha = `${anio}-${mes}-${dia}`;
      }
      
      const dniMatches = [...line.matchAll(/\b(\d{8})\b/g)];
      if (dniMatches.length > 0) {
        record.dni = dniMatches[0][1];
        if (dniMatches.length > 1) {
          const secondNum = dniMatches[1][1];
          if (secondNum.startsWith('9')) {
            record.celular = secondNum;
          }
        }
      }
      
      if (!record.celular) {
        const celMatch = line.match(/\b(9\d{8})\b/);
        if (celMatch) {
          record.celular = celMatch[1];
        }
      }
      
      if (record.dni) {
        const dniIndex = line.indexOf(record.dni);
        let searchEndIndex = line.length;
        
        if (record.celular) {
          const celIndex = line.indexOf(record.celular);
          if (celIndex > dniIndex) {
            searchEndIndex = celIndex;
          }
        } else {
          const lineLower = line.toLowerCase();
          for (const [prodKey, variations] of Object.entries(productosMap)) {
            for (const variation of variations) {
              const prodIndex = lineLower.indexOf(variation);
              if (prodIndex > dniIndex && prodIndex < searchEndIndex) {
                searchEndIndex = prodIndex;
                break;
              }
            }
          }
        }
        
        const textBetween = line.substring(dniIndex + record.dni.length, searchEndIndex).trim();
        
        console.log('🔍 Procesando nombre:', {
          dni: record.dni,
          textoCrudo: textBetween,
          longitud: textBetween.length
        });
        
        const cleanName = limpiarNombre(textBetween);
        
        console.log('✨ Nombre limpio:', {
          original: textBetween,
          limpio: cleanName,
          longitud: cleanName.length
        });
        
        if (cleanName.length >= 2 && cleanName.length < 50 && !cleanName.match(/^\d/)) {
          const lowerName = cleanName.toLowerCase();
          const isProducto = Object.keys(productosMap).some(p => 
            p.toLowerCase().includes(lowerName) || lowerName.includes(p.toLowerCase())
          );
          const isCiudad = ciudadesList.some(c => c.toLowerCase() === lowerName);
          
          if (!isProducto && !isCiudad) {
            record.nombre = cleanName;
            console.log('✅ Nombre asignado:', cleanName);
          } else {
            console.log('❌ Nombre rechazado (es producto o ciudad):', cleanName);
          }
        } else {
          console.log('❌ Nombre rechazado (validación):', {
            nombre: cleanName,
            longitud: cleanName.length,
            empiezaConNumero: cleanName.match(/^\d/) ? 'Sí' : 'No'
          });
        }
      }
      
      const montoPatterns = [
        /S\/?\.?\s*(\d{1,3}(?:\.\d{3})+)/gi,
        /S\/?\s*(\d{3,6})/gi,
        /s\/?\s*(\d+(?:\.\d+)?)/gi
      ];
      
      for (const pattern of montoPatterns) {
        const matches = [...line.matchAll(pattern)];
        for (const match of matches) {
          let montoStr = match[1].replace(/\./g, '');
          let montoNum = parseInt(montoStr);
          
          const contextMatch = line.match(/[Ss]\/?\s*(\d)\.(\d{2,3})/);
          if (contextMatch && montoNum === 100) {
            const parteEntera = contextMatch[1];
            const parteDecimal = contextMatch[2];
            if (parteEntera === '1' && parteDecimal === '000') {
              montoNum = 1000;
            }
          }
          
          if (montoNum >= 100 && montoNum <= 100000 && 
              montoNum !== 2026 && montoNum !== 2006 &&
              !(montoStr.length === 9 && montoStr.startsWith('9')) &&
              montoStr.length >= 3 && montoStr.length <= 6) {
            record.monto = montoNum.toString();
            break;
          }
        }
        if (record.monto) break;
      }
      
      const tasaMatch = line.match(/(\d+(?:\.\d+)?)\s*%/);
      if (tasaMatch) {
        const tasa = parseFloat(tasaMatch[1]);
        if (tasa > 0 && tasa < 100) {
          record.tasa = tasaMatch[1];
        }
      }
      
      const lineLower = line.toLowerCase();
      for (const [prodKey, variations] of Object.entries(productosMap)) {
        if (variations.some(v => lineLower.includes(v))) {
          record.producto = prodKey;
          break;
        }
      }
      
      for (const ciudad of ciudadesList) {
        if (lineLower.includes(ciudad.toLowerCase())) {
          record.lugar = ciudad;
          break;
        }
      }
      
      for (const estado of estadosList) {
        if (lineLower.includes(estado.toLowerCase())) {
          record.observacion = estado;
          break;
        }
      }
      
      if (record.observacion) {
        const obsIndex = line.toLowerCase().indexOf(record.observacion.toLowerCase());
        if (obsIndex !== -1) {
          const afterObs = line.substring(obsIndex + record.observacion.length);
          const gananciasMatch = afterObs.match(/\b(\d{2,3}(?:\.\d{2})?)\b/);
          if (gananciasMatch) {
            const gananciaNum = parseFloat(gananciasMatch[1]);
            if (gananciaNum >= 10 && gananciaNum <= 999) {
              record.ganancias = gananciasMatch[1];
            }
          }
        }
      }
      
      if (!record.ganancias) {
        const lastNumbers = [...line.matchAll(/\b(\d{2,3}(?:\.\d{2})?)\b/g)];
        if (lastNumbers.length > 0) {
          const lastNum = lastNumbers[lastNumbers.length - 1][1];
          const gananciaNum = parseFloat(lastNum);
          if (gananciaNum >= 10 && gananciaNum <= 999) {
            if (lastNum !== record.tasa && lastNum !== record.monto) {
              record.ganancias = lastNum;
            }
          }
        }
      }
      
      if (record.dni && record.dni.length === 8) {
        records.push(record);
      }
    });
    
    return records;
  };

  const handleApplyData = () => {
    if (parsedData && parsedData.length > 0) {
      onDataExtracted(parsedData);
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
