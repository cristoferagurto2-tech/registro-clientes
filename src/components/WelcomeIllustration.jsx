import React from 'react';
import './WelcomeIllustration.css';

const WelcomeIllustration = () => {
  return (
    <div className="welcome-illustration">
      <svg 
        viewBox="0 0 300 280" 
        xmlns="http://www.w3.org/2000/svg"
        className="illustration-svg"
      >
        {/* Fondo circular decorativo */}
        <circle cx="150" cy="140" r="120" fill="#e0f2fe" opacity="0.5" />
        <circle cx="220" cy="80" r="40" fill="#dbeafe" opacity="0.6" />
        <circle cx="80" cy="200" r="30" fill="#dbeafe" opacity="0.4" />

        {/* Personaje - Mujer profesional */}
        <g transform="translate(85, 50)">
          {/* Cabello - parte trasera */}
          <path
            d="M65 25 
               Q30 30, 25 70 
               Q20 100, 35 120
               L95 120
               Q110 100, 105 70
               Q100 30, 65 25"
            fill="#1e3a5f"
          />

          {/* Cuello */}
          <rect x="55" y="95" width="20" height="25" fill="#fdba74" />

          {/* Cara */}
          <ellipse cx="65" cy="65" rx="32" ry="38" fill="#fdba74" />
          
          {/* Cabello - flequillo */}
          <path
            d="M33 45
               Q40 25, 65 25
               Q90 25, 97 45
               Q95 35, 80 30
               Q65 28, 50 30
               Q35 35, 33 45"
            fill="#1e3a5f"
          />

          {/* Ojos */}
          <ellipse cx="52" cy="60" rx="6" ry="7" fill="white" />
          <circle cx="52" cy="60" r="4" fill="#1e293b" />
          <circle cx="53" cy="58" r="1.5" fill="white" />

          <ellipse cx="78" cy="60" rx="6" ry="7" fill="white" />
          <circle cx="78" cy="60" r="4" fill="#1e293b" />
          <circle cx="79" cy="58" r="1.5" fill="white" />

          {/* Cejas */}
          <path d="M45 50 Q52 48, 59 50" stroke="#1e3a5f" strokeWidth="2" fill="none" />
          <path d="M71 50 Q78 48, 85 50" stroke="#1e3a5f" strokeWidth="2" fill="none" />

          {/* Nariz */}
          <path d="M65 65 L62 75 L68 75" stroke="#f97316" strokeWidth="1.5" fill="none" opacity="0.6" />

          {/* Sonrisa */}
          <path d="M55 82 Q65 90, 75 82" stroke="#be123c" strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* Mejillas */}
          <circle cx="45" cy="75" r="5" fill="#fca5a5" opacity="0.4" />
          <circle cx="85" cy="75" r="5" fill="#fca5a5" opacity="0.4" />

          {/* Gafas */}
          <circle cx="52" cy="62" r="12" stroke="#1e3a5f" strokeWidth="2" fill="none" />
          <circle cx="78" cy="62" r="12" stroke="#1e3a5f" strokeWidth="2" fill="none" />
          <line x1="64" y1="62" x2="66" y2="62" stroke="#1e3a5f" strokeWidth="2" />
          <line x1="40" y1="58" x2="35" y2="55" stroke="#1e3a5f" strokeWidth="2" />
          <line x1="90" y1="58" x2="95" y2="55" stroke="#1e3a5f" strokeWidth="2" />

          {/* Cuerpo - Blazer */}
          <path
            d="M35 120
               L30 200
               L100 200
               L95 120
               Z"
            fill="#1e3a8a"
          />
          
          {/* Cuello de camisa */}
          <path
            d="M55 120
               L65 140
               L75 120"
            fill="white"
          />

          {/* Blazer - solapa */}
          <path
            d="M35 120
               L55 160
               L65 140
               L55 120"
            fill="#1e40af"
          />
          
          <path
            d="M95 120
               L75 160
               L65 140
               L75 120"
            fill="#1e40af"
          />

          {/* Manos sosteniendo tablet/documentos */}
          <ellipse cx="45" cy="165" rx="8" ry="12" fill="#fdba74" />
          <ellipse cx="85" cy="165" rx="8" ry="12" fill="#fdba74" />

          {/* Tablet/Documentos */}
          <rect x="40" y="145" width="50" height="35" rx="3" fill="white" stroke="#1e3a8a" strokeWidth="2" />
          <line x1="48" y1="155" x2="82" y2="155" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="48" y1="162" x2="75" y2="162" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="48" y1="169" x2="80" y2="169" stroke="#cbd5e1" strokeWidth="2" />

          {/* Check mark en el documento */}
          <circle cx="78" cy="152" r="8" fill="#22c55e" />
          <path d="M74 152 L77 155 L82 149" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>

        {/* Documentos flotantes decorativos */}
        <g transform="translate(200, 80)">
          {/* Documento 1 */}
          <rect x="0" y="0" width="35" height="45" rx="3" fill="white" stroke="#1e3a8a" strokeWidth="2" opacity="0.9" />
          <line x1="6" y1="10" x2="29" y2="10" stroke="#3b82f6" strokeWidth="2" />
          <line x1="6" y1="18" x2="25" y2="18" stroke="#93c5fd" strokeWidth="2" />
          <line x1="6" y1="26" x2="28" y2="26" stroke="#93c5fd" strokeWidth="2" />
          <rect x="6" y1="34" width="12" height="6" rx="1" fill="#dbeafe" />
        </g>

        <g transform="translate(30, 90)">
          {/* Documento 2 */}
          <rect x="0" y="0" width="30" height="40" rx="3" fill="white" stroke="#1e3a8a" strokeWidth="2" opacity="0.8" />
          <line x1="5" y1="8" x2="25" y2="8" stroke="#60a5fa" strokeWidth="2" />
          <line x1="5" y1="15" x2="22" y2="15" stroke="#bfdbfe" strokeWidth="2" />
          <line x1="5" y1="22" x2="24" y2="22" stroke="#bfdbfe" strokeWidth="2" />
          <circle cx="22" cy="30" r="5" fill="#22c55e" />
          <path d="M19 30 L21 32 L25 27" stroke="white" strokeWidth="1.5" fill="none" />
        </g>

        <g transform="translate(220, 180)">
          {/* Documento 3 */}
          <rect x="0" y="0" width="28" height="36" rx="3" fill="white" stroke="#1e3a8a" strokeWidth="2" opacity="0.7" />
          <line x1="4" y1="7" x2="24" y2="7" stroke="#93c5fd" strokeWidth="2" />
          <line x1="4" y1="14" x2="20" y2="14" stroke="#dbeafe" strokeWidth="2" />
          <line x1="4" y1="21" x2="22" y2="21" stroke="#dbeafe" strokeWidth="2" />
        </g>

        {/* Icono de gráfico */}
        <g transform="translate(45, 180)">
          <rect x="0" y="0" width="28" height="28" rx="14" fill="#dbeafe" />
          <polyline points="5,18 10,12 15,16 23,8" stroke="#1e3a8a" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="23" cy="8" r="2" fill="#22c55e" />
        </g>

        {/* Icono de carpeta */}
        <g transform="translate(190, 40)">
          <rect x="0" y="5" width="30" height="22" rx="3" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" />
          <path d="M0 5 L5 0 L15 0 L20 5" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" />
          <rect x="20" y="12" width="8" height="8" rx="2" fill="white" opacity="0.6" />
        </g>
      </svg>
    </div>
  );
};

export default WelcomeIllustration;
