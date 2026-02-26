import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDocuments } from '../context/DocumentsContext';
import './AvanceAnual.css';

export default function AvanceAnual() {
  const { user } = useAuth();
  const { MESES, getMergedData } = useDocuments();
  const [showDetails, setShowDetails] = useState(false);

  // Función para parsear montos correctamente manejando separadores de miles y decimales
  // Formatos soportados: "1.000", "1.000,50", "1000", "1000.50", "1,000.50"
  const parseMonto = (value) => {
    if (!value || value === '') return 0;
    const str = String(value).trim();
    
    // Detectar el formato basado en la posición de puntos y comas
    const lastDot = str.lastIndexOf('.');
    const lastComma = str.lastIndexOf(',');
    
    // Si hay tanto punto como coma, el último es el separador decimal
    if (lastDot !== -1 && lastComma !== -1) {
      if (lastComma > lastDot) {
        // Formato europeo: 1.000,50
        return parseFloat(str.replace(/\./g, '').replace(',', '.')) || 0;
      } else {
        // Formato americano: 1,000.50
        return parseFloat(str.replace(/,/g, '')) || 0;
      }
    }
    
    // Si solo hay punto
    if (lastDot !== -1) {
      const afterDot = str.substring(lastDot + 1);
      // Si después del punto hay 1-2 dígitos, es separador decimal
      // Si hay 3 dígitos, es separador de miles
      if (afterDot.length <= 2) {
        return parseFloat(str) || 0;
      } else {
        // Es separador de miles, eliminarlo
        return parseFloat(str.replace(/\./g, '')) || 0;
      }
    }
    
    // Si solo hay coma
    if (lastComma !== -1) {
      const afterComma = str.substring(lastComma + 1);
      // Si después de la coma hay 1-2 dígitos, es separador decimal
      if (afterComma.length <= 2) {
        return parseFloat(str.replace(',', '.')) || 0;
      } else {
        // Es separador de miles, eliminarlo
        return parseFloat(str.replace(/,/g, '')) || 0;
      }
    }
    
    // Sin separadores, parsear directamente
    return parseFloat(str) || 0;
  };

  const calcularResumen = () => {
    const resumen = MESES.map(mes => {
      const data = getMergedData(user?.id, mes);
      if (!data || !data.data) {
        return {
          mes: mes,
          clientes: 0,
          monto: 0,
          ganancias: 0
        };
      }

      const filasConDatos = data.data.filter(row => row[2] && row[2] !== '');
      const totalClientes = filasConDatos.length;
      const montoTotal = filasConDatos.reduce((sum, row) => {
        const monto = parseMonto(row[6]);
        return sum + monto;
      }, 0);
      const totalGanancias = filasConDatos.reduce((sum, row) => {
        const ganancia = parseMonto(row[10]);
        return sum + ganancia;
      }, 0);

      return {
        mes: mes,
        clientes: totalClientes,
        monto: montoTotal,
        ganancias: totalGanancias
      };
    });

    return resumen;
  };

  const resumen = calcularResumen();
  const totalClientesAnual = resumen.reduce((sum, m) => sum + m.clientes, 0);
  const totalMontoAnual = resumen.reduce((sum, m) => sum + m.monto, 0);
  const totalGananciasAnual = resumen.reduce((sum, m) => sum + m.ganancias, 0);
  const mesesConVentas = resumen.filter(m => m.clientes > 0).length;

  return (
    <div className="avance-anual">
      <div className="avance-header">
        <h2>Avance del Año 2026</h2>
        <p>Resumen de ventas y ganancias por mes</p>
      </div>

      <div className="avance-resumen-cards">
        <div className="resumen-card">
          <span className="resumen-label">Total Clientes</span>
          <span className="resumen-value">{totalClientesAnual}</span>
        </div>
        <div className="resumen-card">
          <span className="resumen-label">Monto Total Anual</span>
          <span className="resumen-value">S/ {totalMontoAnual.toFixed(2)}</span>
        </div>
        <div className="resumen-card">
          <span className="resumen-label">Ganancias Anuales</span>
          <span className="resumen-value">S/ {totalGananciasAnual.toFixed(2)}</span>
        </div>
        <div className="resumen-card">
          <span className="resumen-label">Meses con Ventas</span>
          <span className="resumen-value">{mesesConVentas}/12</span>
        </div>
      </div>

      <div className="avance-tabla-section">
        <div className="tabla-header">
          <h3>Resumen por Meses</h3>
          <button 
            className="btn-toggle-details"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Ocultar Detalles' : 'Ver Detalles'}
          </button>
        </div>
        
        <div className="meses-table-wrapper">
          <table className="meses-table-avance">
            <thead>
              <tr>
                <th className="col-mes-header">Mes</th>
                <th className="col-cliente-header">Cliente</th>
                <th className="col-numero-header">Monto Total</th>
                <th className="col-numero-header">Ganancia</th>
                <th className="col-estado-header">Estado</th>
              </tr>
            </thead>
            <tbody>
              {resumen.map((mes, index) => (
                <tr key={index}>
                  <td className="col-mes">{mes.mes}</td>
                  <td className="col-cliente">{mes.clientes}</td>
                  <td className="col-numero">S/ {mes.monto.toFixed(2)}</td>
                  <td className="col-numero">S/ {mes.ganancias.toFixed(2)}</td>
                  <td className="col-estado">
                    {mes.clientes > 0 ? (
                      <span className="check-icon">✓</span>
                    ) : (
                      <span className="no-venta">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showDetails && (
          <div className="detalles-section">
            <h4>Detalles por Mes</h4>
            <div className="detalles-grid">
              {resumen.filter(m => m.clientes > 0).map((mes, idx) => (
                <div key={idx} className="detalle-card">
                  <div className="detalle-mes">{mes.mes}</div>
                  <div className="detalle-stats">
                    <span>{mes.clientes} clientes</span>
                    <span className="detalle-monto">S/ {mes.monto.toFixed(2)}</span>
                  </div>
                </div>
              ))}
              {resumen.filter(m => m.clientes > 0).length === 0 && (
                <p className="no-data">Aún no hay ventas registradas</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="avance-leyenda">
        <h4>Leyenda</h4>
        <div className="leyenda-items">
          <span className="leyenda-item">
            <span className="check-icon small">✓</span> Mes con ventas
          </span>
          <span className="leyenda-item">
            <span className="no-venta">-</span> Sin ventas
          </span>
        </div>
      </div>
    </div>
  );
}
