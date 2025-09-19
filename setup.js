#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';

console.log(chalk.blue.bold('🚀 Configurando Gestor de Tareas - Don Edgar Edition'));
console.log(chalk.dim('='.repeat(55)));

async function setup() {
  try {
    // Crear archivo .env si no existe
    const envFile = path.join(process.cwd(), '.env');
    try {
      await fs.access(envFile);
      console.log(chalk.green('✅ Archivo .env ya existe'));
    } catch {
      const envExample = await fs.readFile('.env.example', 'utf8');
      await fs.writeFile(envFile, envExample);
      console.log(chalk.green('✅ Archivo .env creado desde .env.example'));
    }

    console.log(chalk.blue('\n📋 Configuración completada'));
    console.log(chalk.dim('='.repeat(55)));
    console.log(chalk.white('\n🎯 Comandos disponibles:'));
    console.log(chalk.cyan('  npm start    ') + chalk.dim('- Ejecutar Gestor de Tareas (MongoDB)'));
    console.log(chalk.cyan('  npm run dev  ') + chalk.dim('- Modo desarrollo con recarga automática'));
    
    console.log(chalk.yellow('\n🌐 Configuración de MongoDB:'));
    console.log(chalk.dim('  1. Instala MongoDB localmente o usa MongoDB Atlas'));
    console.log(chalk.dim('  2. Configura MONGODB_URI en el archivo .env'));
    console.log(chalk.dim('  3. Ejecuta: npm start'));
    console.log(chalk.dim('  4. ¡Don Edgar estará orgulloso de tu migración total!'));

    console.log(chalk.green.bold('\n🎉 ¡Sistema MongoDB listo - Don Edgar aprobaría!'));

  } catch (error) {
    console.error(chalk.red('❌ Error en la configuración:', error.message));
    process.exit(1);
  }
}

setup();