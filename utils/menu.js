import inquirer from 'inquirer';
import chalk from 'chalk';
import { mostrarTitulo } from '../helpers/formatters.js';

export default async function mostrarMenu() {
  console.clear();
  mostrarTitulo('GESTOR DE TAREAS - Don Edgar Edition');
  
  const { opcion } = await inquirer.prompt([
    {
      type: 'list',
      name: 'opcion',
      message: chalk.cyan('¿Qué deseas hacer?'),
      choices: [
        { name: '➕ Agregar nueva tarea', value: '1' },
        { name: '📄 Listar todas las tareas', value: '2' },
        { name: '✅ Listar tareas completadas', value: '3' },
        { name: '⏳ Listar tareas pendientes', value: '4' },
        { name: '✏️  Marcar tarea como completada', value: '5' },
        { name: '🔄 Editar descripción de tarea', value: '6' },
        { name: '🗑️  Eliminar tarea', value: '7' },
        { name: '🔍 Buscar tareas', value: '8' },
        { name: '📊 Estadísticas', value: '9' },
        { name: '🚪 Salir', value: '0' }
      ],
      pageSize: 12
    }
  ]);
  return opcion;
}