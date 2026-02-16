import { useState, useEffect } from 'react';
import './ClientesData.css';

// Datos de ejemplo basados en el CSV (en producción vendrían de una API o archivo)
const datosClientes = [
  {
    id: 1,
    fecha: '10/02/2025',
    mes: 'Febrero',
    nombre: 'Juan Pérez García',
    dni: '12345678',
    celular: '987654321',
    producto: 'Televisor LED 50 pulgadas',
    monto: 2500.00,
    aCuenta: 1000.00,
    fechaVencimiento: '10/03/2025',
    observacion: 'Cobro de préstamo'
  },
  {
    id: 2,
    fecha: '05/02/2025',
    mes: 'Febrero',
    nombre: 'María López Torres',
    dni: '87654321',
    celular: '912345678',
    producto: 'Refrigeradora 300L',
    monto: 1800.00,
    aCuenta: 1800.00,
    fechaVencimiento: '05/03/2025',
    observacion: 'Pagado'
  },
  {
    id: 3,
    fecha: '28/01/2025',
    mes: 'Enero',
    nombre: 'Carlos Rodríguez',
    dni: '45678912',
    celular: '956789123',
    producto: 'Lavadora automática',
    monto: 1200.00,
    aCuenta: 400.00,
    fechaVencimiento: '28/02/2025',
    observacion: 'Pendiente'
  },
  {
    id: 4,
    fecha: '08/02/2025',
    mes: 'Febrero',
    nombre: 'Ana María Sánchez',
    dni: '78912345',
    celular: '934567890',
    producto: 'Microondas digital',
    monto: 450.00,
    aCuenta: 0.00,
    fechaVencimiento: '08/03/2025',
    observacion: 'Cancelado'
  },
  {
    id: 5,
    fecha: '15/01/2025',
    mes: 'Enero',
    nombre: 'Pedro Gómez',
    dni: '11111111',
    celular: '911111111',
    producto: 'Cocina a gas',
    monto: 850.00,
    aCuenta: 850.00,
    fechaVencimiento: '15/02/2025',
    observacion: 'Pagado'
  },
  {
    id: 6,
    fecha: '20/02/2025',
    mes: 'Febrero',
    nombre: 'Laura Torres',
    dni: '22222222',
    celular: '922222222',
    producto: 'Licuadora industrial',
    monto: 320.00,
    aCuenta: 100.00,
    fechaVencimiento: '20/03/2025',
    observacion: 'En espera'
  }
];

const meses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function ClientesData({ isAdmin }) {
  const [mesSeleccionado, setMesSeleccionado] = useState('Todos');
  const [clientesFiltrados, setClientesFiltrados] = useState(datosClientes);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    let filtrados = datosClientes;

    // Filtrar por mes
    if (mesSeleccionado !== 'Todos') {
      filtrados = filtrados.filter(c => c.mes === mesSeleccionado);
    }

    // Filtrar por búsqueda
    if (busqueda) {
      filtrados = filtrados.filter(c => 
        c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.dni.includes(busqueda) ||
        c.producto.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    setClientesFiltrados(filtrados);
  }, [mesSeleccionado, busqueda]);

  const getObservacionColor = (obs) => {
    const lowerObs = obs.toLowerCase();
    if (lowerObs.includes('cancelado')) return 'status-cancelado';
    if (lowerObs.includes('pagado')) return 'status-pagado';
    if (lowerObs.includes('pendiente')) return 'status-pendiente';
    if (lowerObs.includes('cobro')) return 'status-cobro';
    if (lowerObs.includes('espera')) return 'status-espera';
    return 'status-default';
  };

  const calcularTotales = () => {
    const totalMonto = clientesFiltrados.reduce((sum, c) => sum + c.monto, 0);
    const totalACuenta = clientesFiltrados.reduce((sum, c) => sum + c.aCuenta, 0);
    const totalPendiente = totalMonto - totalACuenta;
    return { totalMonto, totalACuenta, totalPendiente };
  };

  const { totalMonto, totalACuenta, totalPendiente } = calcularTotales();

  return (
    <div className="clientes-container">
      {/* Controls */}
      <div className="clientes-controls">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre, DNI o producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="month-selector">
          <span className="selector-label">📅 Mes:</span>
          <select 
            value={mesSeleccionado} 
            onChange={(e) => setMesSeleccionado(e.target.value)}
          >
            <option value="Todos">Todos los meses</option>
            {meses.map(mes => (
              <option key={mes} value={mes}>{mes}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-card-icon">👥</div>
          <div className="stat-card-content">
            <span className="stat-card-value">{clientesFiltrados.length}</span>
            <span className="stat-card-label">Total Clientes</span>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-card-icon">💰</div>
          <div className="stat-card-content">
            <span className="stat-card-value">S/ {totalMonto.toFixed(2)}</span>
            <span className="stat-card-label">Monto Total</span>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-card-icon">💵</div>
          <div className="stat-card-content">
            <span className="stat-card-value">S/ {totalACuenta.toFixed(2)}</span>
            <span className="stat-card-label">A Cuenta</span>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-card-icon">⏳</div>
          <div className="stat-card-content">
            <span className="stat-card-value">S/ {totalPendiente.toFixed(2)}</span>
            <span className="stat-card-label">Pendiente</span>
          </div>
        </div>
      </div>

      {/* Clientes Table */}
      <div className="table-container">
        <div className="table-header">
          <h3>📋 Historial de Clientes</h3>
          {isAdmin && (
            <button className="btn-export">
              <span>📥</span> Exportar Excel
            </button>
          )}
        </div>

        <div className="table-wrapper">
          <table className="clientes-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Mes</th>
                <th>Cliente</th>
                <th>DNI</th>
                <th>Celular</th>
                <th>Producto</th>
                <th>Monto</th>
                <th>A Cuenta</th>
                <th>Vencimiento</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map(cliente => (
                <tr key={cliente.id}>
                  <td>{cliente.fecha}</td>
                  <td>{cliente.mes}</td>
                  <td className="cliente-nombre">{cliente.nombre}</td>
                  <td>{cliente.dni}</td>
                  <td>{cliente.celular}</td>
                  <td>{cliente.producto}</td>
                  <td className="monto">S/ {cliente.monto.toFixed(2)}</td>
                  <td className="monto">S/ {cliente.aCuenta.toFixed(2)}</td>
                  <td>{cliente.fechaVencimiento}</td>
                  <td>
                    <span className={`status-badge ${getObservacionColor(cliente.observacion)}`}>
                      {cliente.observacion}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {clientesFiltrados.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <p>No se encontraron clientes</p>
              <span className="empty-hint">Intenta con otro mes o término de búsqueda</span>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="status-legend">
        <span className="legend-title">Leyenda de Estados:</span>
        <div className="legend-items">
          <span className="legend-item"><span className="dot yellow"></span> Cobro</span>
          <span className="legend-item"><span className="dot green"></span> Pagado</span>
          <span className="legend-item"><span className="dot orange"></span> Pendiente</span>
          <span className="legend-item"><span className="dot blue"></span> En espera</span>
          <span className="legend-item"><span className="dot red"></span> Cancelado</span>
        </div>
      </div>
    </div>
  );
}
