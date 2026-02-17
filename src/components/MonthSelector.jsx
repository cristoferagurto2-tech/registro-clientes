import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDocuments } from '../context/DocumentsContext';
import AvanceAnual from './AvanceAnual';
import './MonthSelector.css';

export default function MonthSelector() {
  const { user } = useAuth();
  const { MESES, hasDocument, setCurrentMonth, getAvailableMonths } = useDocuments();
  const [activeTab, setActiveTab] = useState('documents'); // 'documents' o 'avance'

  const availableMonths = getAvailableMonths(user?.id);

  // Si está en la pestaña de avance anual, mostrar ese componente
  if (activeTab === 'avance') {
    return (
      <div className="month-selector">
        <div className="tabs-navigation">
          <button 
            className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            Mis Documentos
          </button>
          <button 
            className={`tab-btn ${activeTab === 'avance' ? 'active' : ''}`}
            onClick={() => setActiveTab('avance')}
          >
            Avance del Año
          </button>
        </div>
        <AvanceAnual />
      </div>
    );
  }

  if (availableMonths.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
        </div>
        <h3>No tiene documentos asignados</h3>
        <p>El administrador aún no le ha asignado documentos.</p>
        <p className="empty-hint">Contacte al administrador para que le asigne sus documentos.</p>
      </div>
    );
  }

  return (
    <div className="month-selector">
      <div className="tabs-navigation">
        <button 
          className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          Mis Documentos
        </button>
        <button 
          className={`tab-btn ${activeTab === 'avance' ? 'active' : ''}`}
          onClick={() => setActiveTab('avance')}
        >
          Avance del Año
        </button>
      </div>

      <div className="selector-header">
        <h2>Mis Documentos</h2>
        <p>Bienvenido {user?.name || 'Cliente'}, estos son sus documentos asignados:</p>
      </div>

      <div className="months-grid-client">
        {MESES.map((month, index) => {
          const hasDoc = hasDocument(user?.id, month);

          return (
            <div 
              key={month} 
              className={`month-card-client ${hasDoc ? 'available' : 'disabled'}`}
              onClick={() => hasDoc && setCurrentMonth(month)}
            >
              <div className="month-number">{String(index + 1).padStart(2, '0')}</div>
              <h3 className="month-name-client">{month}</h3>
              
              {hasDoc ? (
                <div className="month-status available">
                  <span className="status-badge">Disponible</span>
                  <button className="btn-open">Abrir Documento</button>
                </div>
              ) : (
                <div className="month-status disabled">
                  <span className="status-badge">No asignado</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="client-info">
        <h4>¿Cómo funciona?</h4>
        <ol>
          <li>Estos son sus documentos personales, solo usted puede verlos</li>
          <li>Seleccione el mes que desea completar</li>
          <li>Complete los datos en el documento</li>
          <li>Guarde sus cambios con el botón "Guardar"</li>
          <li>Puede volver a editar cuando lo necesite</li>
        </ol>
      </div>
    </div>
  );
}
