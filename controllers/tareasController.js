import inquirer from 'inquirer';
import _ from 'lodash';
import { TareaRepository } from '../models/tareaModel.js';
import { 
  formatearTarea, 
  mostrarTitulo, 
  mostrarMensajeExito, 
  mostrarMensajeError, 
  mostrarMensajeAdvertencia,
  mostrarMensajeInfo 
} from '../helpers/formatters.js';
import { validarDescripcionTarea, limpiarTexto } from '../helpers/validators.js';

export async function agregarTarea() {
  mostrarTitulo('AGREGAR NUEVA TAREA');
  
  const { descripcion } = await inquirer.prompt([
    { 
      type: 'input', 
      name: 'descripcion', 
      message: '✏️ Descripción de la tarea:',
      validate: (input) => {
        const validacion = validarDescripcionTarea(input);
        return validacion.valido || validacion.mensaje;
      }
    }
  ]);

  try {
    const descripcionLimpia = limpiarTexto(descripcion);
    
    // Verificar duplicados usando MongoDB nativo
    const tareaExistente = await TareaRepository.buscarPorDescripcion(descripcionLimpia);

    if (tareaExistente) {
      mostrarMensajeAdvertencia('Ya existe una tarea con esa descripción');
      return;
    }

    await TareaRepository.crear(descripcionLimpia);
    mostrarMensajeExito('Tarea agregada exitosamente');
  } catch (error) {
    mostrarMensajeError(`Error al agregar la tarea: ${error.message}`);
  }
}

export async function listarTodasLasTareas() {
  await listarTareas('todas');
}

export async function listarTareasCompletadas() {
  await listarTareas('completadas');
}

export async function listarTareasPendientes() {
  await listarTareas('pendientes');
}

export async function listarTareas(filtro = 'todas') {
  try {
    let query = {};
    let titulo;

    switch (filtro) {
      case 'completadas':
        query.completada = true;
        titulo = 'TAREAS COMPLETADAS';
        break;
      case 'pendientes':
        query.completada = false;
        titulo = 'TAREAS PENDIENTES';
        break;
      default:
        titulo = 'TODAS LAS TAREAS';
    }

    // Usar MongoDB nativo - ya viene ordenado desde el repositorio
    const tareas = await TareaRepository.buscarTodas(query);

    if (_.isEmpty(tareas)) {
      mostrarMensajeInfo(`No hay tareas ${filtro === 'todas' ? 'registradas' : filtro}`);
      return;
    }

    mostrarTitulo(titulo);
    console.log(`Total: ${tareas.length} tareas\n`);

    tareas.forEach((tarea, index) => {
      // Convertir el documento de MongoDB a objeto para formatear
      const tareaObj = {
        id: tarea._id.toString(),
        descripcion: tarea.descripcion,
        completada: tarea.completada,
        fechaCreacion: tarea.fechaCreacion,
        fechaCompletada: tarea.fechaCompletada
      };
      console.log(formatearTarea(tareaObj, index));
    });

    await inquirer.prompt([{
      type: 'input',
      name: 'continuar',
      message: 'Presiona Enter para continuar...'
    }]);

  } catch (error) {
    mostrarMensajeError(`Error al listar las tareas: ${error.message}`);
  }
}

export async function completarTarea() {
  try {
    const tareasPendientes = await TareaRepository.buscarTodas({ completada: false });
    
    if (_.isEmpty(tareasPendientes)) {
      mostrarMensajeInfo('No hay tareas pendientes para completar');
      return;
    }

    mostrarTitulo('MARCAR TAREA COMO COMPLETADA');

    const { tareaSeleccionada } = await inquirer.prompt([
      {
        type: 'list',
        name: 'tareaSeleccionada',
        message: '✅ Selecciona la tarea a completar:',
        choices: tareasPendientes.map(tarea => ({
          name: tarea.descripcion,
          value: tarea._id.toString()
        }))
      }
    ]);

    await TareaRepository.completar(tareaSeleccionada);
    mostrarMensajeExito('Tarea marcada como completada');

  } catch (error) {
    mostrarMensajeError(`Error al completar la tarea: ${error.message}`);
  }
}

export async function editarTarea() {
  try {
    const tareas = await TareaRepository.buscarTodas();
    
    if (_.isEmpty(tareas)) {
      mostrarMensajeInfo('No hay tareas para editar');
      return;
    }

    mostrarTitulo('EDITAR DESCRIPCIÓN DE TAREA');

    const { tareaSeleccionada } = await inquirer.prompt([
      {
        type: 'list',
        name: 'tareaSeleccionada',
        message: '🔄 Selecciona la tarea a editar:',
        choices: tareas.map(tarea => ({
          name: `[${tarea.completada ? '✅' : '❌'}] ${tarea.descripcion}`,
          value: tarea._id.toString()
        }))
      }
    ]);

    const tarea = await TareaRepository.buscarPorId(tareaSeleccionada);
    
    const { nuevaDescripcion } = await inquirer.prompt([
      { 
        type: 'input', 
        name: 'nuevaDescripcion', 
        message: 'Nueva descripción:',
        default: tarea.descripcion,
        validate: (input) => {
          const validacion = validarDescripcionTarea(input);
          return validacion.valido || validacion.mensaje;
        }
      }
    ]);

    await TareaRepository.actualizar(tareaSeleccionada, { 
      descripcion: limpiarTexto(nuevaDescripcion) 
    });
    
    mostrarMensajeExito('Descripción actualizada exitosamente');

  } catch (error) {
    mostrarMensajeError(`Error al editar la tarea: ${error.message}`);
  }
}

export async function eliminarTarea() {
  try {
    const tareas = await TareaRepository.buscarTodas();
    
    if (_.isEmpty(tareas)) {
      mostrarMensajeInfo('No hay tareas para eliminar');
      return;
    }

    mostrarTitulo('ELIMINAR TAREA');

    const { tareaSeleccionada } = await inquirer.prompt([
      {
        type: 'list',
        name: 'tareaSeleccionada',
        message: '🗑️ Selecciona la tarea a eliminar:',
        choices: tareas.map(tarea => ({
          name: `[${tarea.completada ? '✅' : '❌'}] ${tarea.descripcion}`,
          value: tarea._id.toString()
        }))
      }
    ]);

    const tarea = await TareaRepository.buscarPorId(tareaSeleccionada);
    
    const { confirmacion } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmacion',
        message: `¿Estás seguro de que quieres eliminar "${tarea.descripcion}"?`,
        default: false
      }
    ]);

    if (confirmacion) {
      await TareaRepository.eliminar(tareaSeleccionada);
      mostrarMensajeExito('Tarea eliminada exitosamente');
    } else {
      mostrarMensajeInfo('Eliminación cancelada');
    }

  } catch (error) {
    mostrarMensajeError(`Error al eliminar la tarea: ${error.message}`);
  }
}

export async function buscarTareas() {
  try {
    const totalTareas = await TareaRepository.contar();
    
    if (totalTareas === 0) {
      mostrarMensajeInfo('No hay tareas registradas');
      return;
    }

    mostrarTitulo('BUSCAR TAREAS');

    const { terminoBusqueda } = await inquirer.prompt([
      {
        type: 'input',
        name: 'terminoBusqueda',
        message: '🔍 Ingresa el término de búsqueda:',
        validate: (input) => input.trim().length >= 2 || 'Ingresa al menos 2 caracteres'
      }
    ]);

    // Buscar usando MongoDB nativo
    const tareasEncontradas = await TareaRepository.buscarPorTexto(terminoBusqueda.trim());

    if (_.isEmpty(tareasEncontradas)) {
      mostrarMensajeInfo(`No se encontraron tareas que contengan "${terminoBusqueda}"`);
      return;
    }

    console.log(`\n🔍 Se encontraron ${tareasEncontradas.length} coincidencia(s):\n`);
    
    tareasEncontradas.forEach((tarea, index) => {
      const tareaObj = {
        id: tarea._id.toString(),
        descripcion: tarea.descripcion,
        completada: tarea.completada,
        fechaCreacion: tarea.fechaCreacion,
        fechaCompletada: tarea.fechaCompletada
      };
      console.log(formatearTarea(tareaObj, index));
    });

    await inquirer.prompt([{
      type: 'input',
      name: 'continuar',
      message: 'Presiona Enter para continuar...'
    }]);

  } catch (error) {
    mostrarMensajeError(`Error al buscar tareas: ${error.message}`);
  }
}

export async function mostrarEstadisticas() {
  try {
    const estadisticas = await TareaRepository.obtenerEstadisticas();
    
    if (estadisticas.total === 0) {
      mostrarMensajeInfo('No hay tareas registradas');
      return;
    }

    mostrarTitulo('ESTADÍSTICAS DE TAREAS');

    const { total, completadas, pendientes } = estadisticas;
    const porcentajeCompletado = Math.round((completadas / total) * 100);

    console.log(`📊 Total de tareas: ${total}`);
    console.log(`✅ Completadas: ${completadas} (${porcentajeCompletado}%)`);
    console.log(`⏳ Pendientes: ${pendientes} (${100 - porcentajeCompletado}%)`);
    
    // Mostrar progreso visual
    const barraProgreso = '█'.repeat(Math.floor(porcentajeCompletado / 5)) + 
                         '░'.repeat(20 - Math.floor(porcentajeCompletado / 5));
    console.log(`\n📈 Progreso: [${barraProgreso}] ${porcentajeCompletado}%`);

    if (completadas > 0) {
      const ultimaCompletada = await TareaRepository.obtenerUltimaCompletada();
      
      if (ultimaCompletada) {
        console.log(`\n🏆 Última tarea completada: "${ultimaCompletada.descripcion}"`);
        console.log(`   Fecha: ${ultimaCompletada.fechaCompletada.toLocaleString()}`);
      }
    }

    // Estadísticas adicionales usando agregaciones nativas de MongoDB
    const diaMasProductivo = await TareaRepository.obtenerDiaMasProductivo();

    if (diaMasProductivo) {
      const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const nombreDia = diasSemana[diaMasProductivo._id - 1];
      console.log(`\n📅 Día más productivo: ${nombreDia} (${diaMasProductivo.count} tareas)`);
    }

    await inquirer.prompt([{
      type: 'input',
      name: 'continuar',
      message: 'Presiona Enter para continuar...'
    }]);

  } catch (error) {
    mostrarMensajeError(`Error al mostrar estadísticas: ${error.message}`);
  }
}