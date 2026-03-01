import React from 'react';
import './WelcomeIllustration.css';

const WelcomeIllustration = () => {
  return (
    <div className="welcome-illustration">
      <svg 
        viewBox="0 0 400 320" 
        xmlns="http://www.w3.org/2000/svg"
        className="illustration-svg"
      >
        {/* Fondo con forma orgánica */}
        <path
          d="M50 200 
             Q30 100, 150 80 
             Q280 60, 320 150 
             Q360 240, 250 280 
             Q140 320, 50 200"
          fill="#dbeafe"
          opacity="0.6"
        />

        {/* Suelo/escena */}
        <rect x="0" y="280" width="400" height="40" fill="#f1f5f9" />

        {/* Silla decorativa */}
        <g transform="translate(60, 160)">
          {/* Asiento */}
          <rect x="0" y="60" width="70" height="50" rx="4" fill="#fbbf24" />
          <rect x="0" y="60" width="70" height="8" rx="2" fill="#f59e0b" />
          
          {/* Respaldo */}
          <rect x="10" y="0" width="50" height="60" rx="4" fill="#fbbf24" />
          <rect x="10" y="55" width="50" height="5" rx="1" fill="#f59e0b" />
          
          {/* Patas */}
          <rect x="8" y="110" width="8" height="40" fill="#9ca3af" />
          <rect x="54" y="110" width="8" height="40" fill="#9ca3af" />
          <rect x="8" y="145" width="54" height="5" rx="2" fill="#6b7280" />
        </g>

        {/* Planta decorativa izquierda */}
        <g transform="translate(30, 220)">
          <path d="M20 50 Q10 30, 5 10" stroke="#22c55e" strokeWidth="3" fill="none" />
          <path d="M20 50 Q20 25, 20 5" stroke="#16a34a" strokeWidth="3" fill="none" />
          <path d="M20 50 Q30 30, 40 15" stroke="#22c55e" strokeWidth="3" fill="none" /
          
          <ellipse cx="5" cy="10" rx="8" ry="12" fill="#4ade80" transform="rotate(-20 5 10)" /
          
          <ellipse cx="20" cy="5" rx="8" ry="14" fill="#22c55e" /
          
          <ellipse cx="40" cy="15" rx="9" ry="13" fill="#4ade80" transform="rotate(20 40 15)" /
          
          {/* Maceta */}
          <path d="M10 50 L30 50 L28 70 L12 70 Z" fill="#f97316" /
          <rect x="8" y="48" width="24" height="6" rx="1" fill="#fb923c" /
        </g>

        {/* Planta decorativa derecha */}
        <g transform="translate(330, 200)">
          <path d="M25 60 Q15 35, 10 15" stroke="#22c55e" strokeWidth="3" fill="none" /
          
          <path d="M25 60 Q25 35, 30 10" stroke="#16a34a" strokeWidth="3" fill="none" /
          
          <path d="M25 60 Q35 35, 45 20" stroke="#22c55e" strokeWidth="3" fill="none" /
          
          
          <ellipse cx="10" cy="15" rx="9" ry="13" fill="#4ade80" transform="rotate(-25 10 15)" /
          
          <ellipse cx="30" cy="10" rx="10" ry="15" fill="#22c55e" /
          
          <ellipse cx="45" cy="20" rx="9" ry="12" fill="#4ade80" transform="rotate(25 45 20)" /
          
          {/* Maceta redonda */}
          <rect x="15" y="60" width="20" height="25" rx="3" fill="#8b5cf6" /
          <rect x="13" y="58" width="24" height="8" rx="2" fill="#a78bfa" /
        </g>

        {/* Personaje - Mujer profesional */}
        <g transform="translate(180, 60)">
          
          {/* Piernas/pantalón */}
          <path
            d="M35 180 
               L35 220 
               L45 220 
               L50 180
               L65 180
               L70 220
               L80 220
               L75 180
               Z"
            fill="#1e3a8a"
          /
          
          {/* Zapatos */}
          <ellipse cx="40" cy="222" rx="12" ry="6" fill="#1f2937" /
          <ellipse cx="75" cy="222" rx="12" ry="6" fill="#1f2937" /
          
          {/* Cuerpo/blazer */}
          <path
            d="M25 80
               Q20 130, 25 180
               L90 180
               Q95 130, 90 80
               Q90 70, 80 65
               L35 65
               Q25 70, 25 80"
            fill="#1e40af"
          /
          
          {/* Blazer - solapas */}
          <path
            d="M25 80
               L40 130
               L57 115
               L35 65"
            fill="#1e3a8a"
          /
          
          <path
            d="M90 80
               L75 130
               L58 115
               L80 65"
            fill="#1e3a8a"
          /
          
          {/* Camisa blanca */}
          <path
            d="M40 65
               L57 90
               L74 65
               L57 60
               Z"
            fill="white"
          /
          
          {/* Cuello */}
          <rect x="52" y="55" width="10" height="12" fill="#fdba74" /
          
          {/* Cabeza/cara */}
          <ellipse cx="57" cy="40" rx="22" ry="26" fill="#fdba74" /
          
          {/* Cabello */}
          <path
            d="M35 25
               Q30 40, 35 55
               L40 50
               Q35 35, 40 20
               Q57 15, 74 20
               Q79 35, 74 50
               L79 55
               Q84 40, 79 25
               Q79 5, 57 5
               Q35 5, 35 25"
            fill="#1f2937"
          /
          
          {/* Flequillo */}
          <path
            d="M35 20
               Q45 12, 57 15
               Q69 12, 79 20
               Q70 8, 57 8
               Q44 8, 35 20"
            fill="#1f2937"
          /
          
          {/* Ojos */}
          <circle cx="48" cy="38" r="3" fill="#1f2937" /
          <circle cx="66" cy="38" r="3" fill="#1f2937" /
          
          {/* Sonrisa */}
          <path d="M52 48 Q57 52, 62 48" stroke="#be123c" strokeWidth="2" fill="none" strokeLinecap="round" /
          
          {/* Brazos */}
          <path
            d="M25 85
               Q15 110, 20 135"
            stroke="#1e3a8a"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
          /
          
          <path
            d="M90 85
               Q100 110, 75 120"
            stroke="#1e3a8a"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
          /
          
          {/* Manos */}
          <circle cx="20" cy="138" r="7" fill="#fdba74" /
          <circle cx="72" cy="122" r="7" fill="#fdba74" /
          
          {/* Laptop/Documentos */}
          <g transform="translate(5, 95) rotate(-10)">
            {/* Base laptop */}
            <rect x="0" y="40" width="55" height="35" rx="3" fill="#374151" /
            <rect x="2" y="42" width="51" height="31" rx="2" fill="#1f2937" /
            
            {/* Pantalla */}
            <path d="M5 40 L10 10 L60 10 L55 40 Z" fill="#374151" /
            
            <rect x="12" y="14" width="46" height="24" rx="1" fill="#3b82f6" /
            
            {/* Contenido pantalla */}
            <rect x="15" y="18" width="20" height="2" rx="1" fill="white" opacity="0.8" /
            
            <rect x="15" y="23" width="30" height="2" rx="1" fill="white" opacity="0.6" /
            
            <rect x="15" y="28" width="25" height="2" rx="1" fill="white" opacity="0.6" /
            
            {/* Checkmark */}
            <circle cx="50" cy="22" r="5" fill="#22c55e" /
            
            <path d="M47 22 L49 24 L53 20" stroke="white" strokeWidth="1.5" fill="none" /
          </g>
        </g>

        {/* Elementos decorativos flotantes */}
        <circle cx="140" cy="100" r="8" fill="#dbeafe" opacity="0.8" /
        <circle cx="320" cy="130" r="6" fill="#fef3c7" opacity="0.8" /
        <circle cx="150" cy="250" r="5" fill="#fce7f3" opacity="0.6" /
      </svg>
    </div>
  );
};

export default WelcomeIllustration;
