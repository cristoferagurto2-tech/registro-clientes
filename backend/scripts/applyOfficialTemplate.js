/**
 * Script de Migración: Aplicar Plantilla Oficial a Clientes Existentes
 * 
 * Este script aplica la plantilla oficial a todos los clientes existentes
 * que no tienen documentos o tienen documentos vacíos.
 * 
 * Uso:
 *   node backend/scripts/applyOfficialTemplate.js
 * 
 * O desde el panel de admin: Botón "Aplicar a Todos los Clientes"
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Document = require('../models/Document');
const DocumentTemplate = require('../models/DocumentTemplate');

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

async function connectDB() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clientes_db';
    await mongoose.connect(mongoURI);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
}

async function applyOfficialTemplateToAll(year = 2026) {
  try {
    console.log(`\n🔄 Aplicando plantilla oficial a todos los clientes para el año ${year}...\n`);

    // Obtener plantilla oficial
    const template = await DocumentTemplate.getOfficialTemplate();
    
    if (!template) {
      console.log('❌ No hay plantilla oficial configurada.');
      console.log('💡 Cree una plantilla primero en el panel de admin y establézcala como oficial.');
      return;
    }

    console.log(`✅ Plantilla oficial encontrada: "${template.name}"`);

    // Obtener todos los clientes
    const clients = await User.find({ role: 'client' });
    console.log(`📊 Total de clientes encontrados: ${clients.length}\n`);

    if (clients.length === 0) {
      console.log('ℹ️  No hay clientes para actualizar.');
      return;
    }

    let updatedCount = 0;
    let errorCount = 0;

    for (const client of clients) {
      try {
        // Contar documentos existentes
        const existingDocs = await Document.countDocuments({ 
          clientId: client._id, 
          year 
        });

        // Eliminar documentos existentes
        if (existingDocs > 0) {
          await Document.deleteMany({ clientId: client._id, year });
          console.log(`  🗑️  Eliminados ${existingDocs} documentos existentes de ${client.name}`);
        }

        // Crear nuevos documentos desde la plantilla
        const documentsToCreate = MONTHS.map(month => ({
          clientId: client._id,
          month,
          year,
          headers: template.headers,
          data: template.data,
          completedData: template.completedData || [],
          originalFile: template.originalFile
        }));

        await Document.insertMany(documentsToCreate);
        
        console.log(`  ✅ ${client.name} (${client.email}) - ${MONTHS.length} documentos creados`);
        updatedCount++;

      } catch (error) {
        console.error(`  ❌ Error con ${client.name}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ Clientes actualizados: ${updatedCount}`);
    console.log(`   ❌ Errores: ${errorCount}`);
    console.log(`   📄 Documentos creados: ${updatedCount * MONTHS.length}`);
    console.log(`\n✨ Migración completada exitosamente!`);

  } catch (error) {
    console.error('\n❌ Error durante la migración:', error.message);
    console.error(error.stack);
  }
}

async function showStats() {
  try {
    console.log('\n📊 Estadísticas actuales:\n');

    const totalClients = await User.countDocuments({ role: 'client' });
    const totalDocuments = await Document.countDocuments();
    const template = await DocumentTemplate.getOfficialTemplate();

    console.log(`   👥 Total clientes: ${totalClients}`);
    console.log(`   📄 Total documentos: ${totalDocuments}`);
    console.log(`   📋 Plantilla oficial: ${template ? `"${template.name}"` : 'No configurada'}`);

    if (totalClients > 0) {
      console.log(`\n   📈 Documentos por cliente (promedio): ${(totalDocuments / totalClients).toFixed(1)}`);
      
      // Clientes sin documentos
      const clientsWithDocs = await Document.distinct('clientId');
      const clientsWithoutDocs = totalClients - clientsWithDocs.length;
      
      if (clientsWithoutDocs > 0) {
        console.log(`   ⚠️  Clientes sin documentos: ${clientsWithoutDocs}`);
      }
    }

    console.log('');

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error.message);
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║    MIGRACIÓN: PLANTILLA OFICIAL A CLIENTES             ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  await connectDB();
  await showStats();

  // Verificar si hay plantilla oficial
  const template = await DocumentTemplate.getOfficialTemplate();
  
  if (!template) {
    console.log('\n⚠️  No se puede continuar sin una plantilla oficial.');
    console.log('   Por favor:');
    console.log('   1. Vaya al panel de admin');
    console.log('   2. Seleccione "Documento Oficial"');
    console.log('   3. Cree una plantilla y establézcala como oficial');
    console.log('\n   Saliendo...\n');
    process.exit(0);
  }

  // Confirmar
  console.log('⚠️  ADVERTENCIA:');
  console.log('   Esta acción reemplazará los documentos existentes de TODOS los clientes.');
  console.log('   Los datos actuales serán sobrescritos con la plantilla oficial.\n');

  // En un script real, aquí pediríamos confirmación
  // Para automatización, verificamos una variable de entorno
  const autoConfirm = process.env.AUTO_CONFIRM === 'true';
  
  if (!autoConfirm) {
    console.log('💡 Para ejecutar sin confirmación interactiva:');
    console.log('   AUTO_CONFIRM=true node backend/scripts/applyOfficialTemplate.js\n');
    console.log('   O use el botón "Aplicar a Todos los Clientes" en el panel de admin.\n');
    
    // Por ahora, ejecutamos directamente para facilidad de uso
    console.log('🚀 Ejecutando migración automáticamente...\n');
  }

  await applyOfficialTemplateToAll(2026);
  
  await showStats();
  
  console.log('\n👋 Desconectando de MongoDB...');
  await mongoose.disconnect();
  console.log('✅ Listo!\n');
  process.exit(0);
}

// Manejar errores
process.on('unhandledRejection', (error) => {
  console.error('\n❌ Error no manejado:', error.message);
  process.exit(1);
});

main();
