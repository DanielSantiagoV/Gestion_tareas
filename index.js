import mostrarMenu from './utils/menu.js';
import { 
  agregarTarea,
  listarTodasLasTareas,
  listarTareasCompletadas, 
  listarTareasPendientes,
  completarTarea,
  editarTarea, 
  eliminarTarea,
  buscarTareas,
  mostrarEstadisticas 
} from './controllers/tareasController.js';
import { mostrarMensajeExito, mostrarMensajeInfo, mostrarMensajeError } from './helpers/formatters.js';
import { conectarBD, desconectarBD } from './config/database.js';

async function main() {
  let salir = false;

  try {
    // Conectar a MongoDB
    await conectarBD();

    // Mensaje de bienvenida
    console.clear();
    mostrarMensajeInfo('¡Bienvenido al Gestor de Tareas de Don Edgar - MongoDB Nativo!');
    mostrarMensajeInfo('Sistema profesional con Driver MongoDB nativo, Lodash y validaciones robustas');

    while (!salir) {
      try {
        const opcion = await mostrarMenu();

        switch (opcion) {
          case '1':
            await agregarTarea();
            break;
          case '2':
            await listarTodasLasTareas();
            break;
          case '3':
            await listarTareasCompletadas();
            break;
          case '4':
            await listarTareasPendientes();
            break;
          case '5':
            await completarTarea();
            break;
          case '6':
            await editarTarea();
            break;
          case '7':
            await eliminarTarea();
            break;
          case '8':
            await buscarTareas();
            break;
          case '9':
            await mostrarEstadisticas();
            break;
          case '0':
            salir = true;
            console.clear();
            mostrarMensajeExito('¡Gracias por usar el Gestor de Tareas de Don Edgar!');
            mostrarMensajeInfo('Don Edgar está orgulloso de tu productividad 🚀');
            break;
          default:
            mostrarMensajeError('Opción no válida');
        }
      } catch (error) {
        mostrarMensajeError(`Error en la operación: ${error.message}`);
        mostrarMensajeInfo('Presiona Enter para continuar...');
        await new Promise(resolve => {
          process.stdin.once('data', resolve);
        });
      }
    }
  } catch (error) {
    mostrarMensajeError(`Error fatal: ${error.message}`);
  } finally {
    // Desconectar de MongoDB al salir
    await desconectarBD();
    process.exit(0);
  }
}

// Manejar señales de terminación
process.on('SIGINT', async () => {
  console.log('\n👋 Cerrando aplicación...');
  await desconectarBD();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n👋 Cerrando aplicación...');
  await desconectarBD();
  process.exit(0);
});

main().catch(async (error) => {
  console.error('Error fatal:', error);
  await desconectarBD();
  process.exit(1);
});