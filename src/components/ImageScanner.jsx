import { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import './ImageScanner.css';

export default function ImageScanner({ onDataExtracted, onClose }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setExtractedText('');
      setParsedData(null);
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
      
      // Parsear los datos extraídos
      const data = parseExtractedData(text);
      setParsedData(data);
    } catch (error) {
      console.error('Error al procesar imagen:', error);
      alert('Error al procesar la imagen. Intenta con otra foto más clara.');
    } finally {
      setIsProcessing(false);
    }
  };

  const parseExtractedData = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const data = {
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
    };

    // Buscar patrones comunes en el texto
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      
      // DNI (8 dígitos)
      const dniMatch = line.match(/\b\d{8}\b/);
      if (dniMatch && !data.dni) {
        data.dni = dniMatch[0];
      }
      
      // Celular (9 dígitos que empiecen con 9)
      const celMatch = line.match(/\b9\d{8}\b/);
      if (celMatch && !data.celular) {
        data.celular = celMatch[0];
      }
      
      // Monto (números con S/ o soles)
      const montoMatch = line.match(/(?:S\/\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
      if (montoMatch && !data.monto) {
        data.monto = montoMatch[1].replace(',', '');
      }
      
      // Tasa (porcentaje)
      const tasaMatch = line.match(/(\d{1,2})\s*%/);
      if (tasaMatch && !data.tasa) {
        data.tasa = tasaMatch[1];
      }
      
      // Productos comunes
      const productos = ['préstamo personal', 'crédito de consumo', 'tarjeta de crédito', 
                        'préstamo vehicular', 'crédito hipotecario', 'microcrédito'];
      productos.forEach(prod => {
        if (lowerLine.includes(prod) && !data.producto) {
          data.producto = prod.charAt(0).toUpperCase() + prod.slice(1);
        }
      });
      
      // Observaciones
      const obsKeywords = ['cobro', 'pendiente', 'espera', 'cancelado'];
      obsKeywords.forEach(keyword => {
        if (lowerLine.includes(keyword) && !data.observacion) {
          data.observacion = keyword.charAt(0).toUpperCase() + keyword.slice(1);
        }
      });
      
      // Nombre (línea con más de 2 palabras que no sea fecha ni número)
      if (line.split(' ').length >= 2 && 
          !line.match(/^\d/) && 
          !line.includes('/') &&
          !data.nombre) {
        data.nombre = line.trim();
      }
      
      // Fecha (formato dd/mm/yyyy o similar)
      const fechaMatch = line.match(/(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/);
      if (fechaMatch && !data.fecha) {
        data.fecha = fechaMatch[0];
      }
      
      // Lugar (después de palabras como "lugar", "ubicación", "oficina")
      if ((lowerLine.includes('lugar') || lowerLine.includes('ubicación')) && !data.lugar) {
        const lugarMatch = line.match(/:\s*(.+)/);
        if (lugarMatch) {
          data.lugar = lugarMatch[1].trim();
        }
      }
    });

    return data;
  };

  const handleApplyData = () => {
    if (parsedData) {
      onDataExtracted(parsedData);
      onClose();
    }
  };

  const handleRetake = () => {
    setSelectedImage(null);
    setExtractedText('');
    setParsedData(null);
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
                  <h4>📋 Datos Detectados:</h4>
                  <div className="data-preview">
                    {Object.entries(parsedData).map(([key, value]) => (
                      value && (
                        <div key={key} className="data-field">
                          <span className="field-label">{key}:</span>
                          <span className="field-value">{value}</span>
                        </div>
                      )
                    ))}
                  </div>
                  
                  <div className="extracted-text-preview">
                    <details>
                      <summary>Ver texto completo extraído</summary>
                      <pre>{extractedText}</pre>
                    </details>
                  </div>

                  <div className="action-buttons">
                    <button 
                      className="btn-apply"
                      onClick={handleApplyData}
                    >
                      ✅ Usar estos Datos
                    </button>
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
