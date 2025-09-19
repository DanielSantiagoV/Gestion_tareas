import { MongoClient } from "mongodb";
import chalk from 'chalk';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'gestor_tareas_don_edgar';
const COLLECTION_NAME = 'tareas';

let client = null;
let db = null;
let collection = null;

export async function conectarBD() {
  try {
    console.log(chalk.blue('🔄 Conectando a MongoDB con Driver Nativo...'));
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    db = client.db(DB_NAME);
    collection = db.collection(COLLECTION_NAME);
    
    // Crear índices para optimizar búsquedas
    await collection.createIndex({ descripcion: 'text' });
    await collection.createIndex({ completada: 1 });
    await collection.createIndex({ fechaCreacion: -1 });
    
    console.log(chalk.green('✅ Conectado exitosamente a MongoDB'));
    console.log(chalk.dim(`📊 Base de datos: ${DB_NAME}`));
    console.log(chalk.dim(`📋 Colección: ${COLLECTION_NAME}`));
    
  } catch (error) {
    console.log(chalk.red('❌ Error al conectar a MongoDB:'));
    console.log(chalk.red(`   ${error.message}`));
    console.log(chalk.yellow('\n⚠️  Asegúrate de que MongoDB esté ejecutándose:'));
    console.log(chalk.dim('   - Instala MongoDB: https://www.mongodb.com/try/download/community'));
    console.log(chalk.dim('   - Ejecuta: mongod'));
    console.log(chalk.dim('   - O usa MongoDB Atlas (nube): https://www.mongodb.com/atlas'));
    process.exit(1);
  }
}

export async function desconectarBD() {
  try {
    if (client) {
      await client.close();
      console.log(chalk.green('✅ Desconectado de MongoDB'));
    }
  } catch (error) {
    console.error(chalk.red('❌ Error al desconectar:', error.message));
  }
}

export function obtenerCollection() {
  if (!collection) {
    throw new Error('Base de datos no conectada. Ejecuta conectarBD() primero.');
  }
  return collection;
}

export function obtenerDB() {
  if (!db) {
    throw new Error('Base de datos no conectada. Ejecuta conectarBD() primero.');
  }
  return db;
}