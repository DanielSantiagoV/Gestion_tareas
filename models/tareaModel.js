import { ObjectId } from 'mongodb';
import { nanoid } from 'nanoid';
import { obtenerCollection, obtenerDB } from '../config/database.js';

export class Tarea {
  constructor(descripcion, completada = false) {
    this.descripcion = descripcion;
    this.completada = completada;
    this.fechaCreacion = new Date();
    this.fechaCompletada = null;
  }

  completar() {
    this.completada = true;
    this.fechaCompletada = new Date();
  }

  descompletar() {
    this.completada = false;
    this.fechaCompletada = null;
  }
}

// Funciones CRUD usando MongoDB Driver Nativo
export const TareaRepository = {
  
  // Crear nueva tarea
  async crear(descripcion) {
    const collection = obtenerCollection();
    const tarea = new Tarea(descripcion);
    
    const resultado = await collection.insertOne(tarea);
    return { ...tarea, _id: resultado.insertedId };
  },

  // Buscar todas las tareas
  async buscarTodas(filtro = {}) {
    const collection = obtenerCollection();
    return await collection.find(filtro).sort({ completada: 1, fechaCreacion: -1 }).toArray();
  },

  // Buscar por ID
  async buscarPorId(id) {
    const collection = obtenerCollection();
    return await collection.findOne({ _id: new ObjectId(id) });
  },

  // Buscar tarea por descripción exacta (para duplicados)
  async buscarPorDescripcion(descripcion) {
    const collection = obtenerCollection();
    return await collection.findOne({ 
      descripcion: { $regex: new RegExp(`^${this.escaparRegex(descripcion)}$`, 'i') }
    });
  },

  // Actualizar tarea por ID
  async actualizar(id, actualizacion) {
    const collection = obtenerCollection();
    return await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: actualizacion }
    );
  },

  // Marcar como completada
  async completar(id) {
    const collection = obtenerCollection();
    return await collection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          completada: true, 
          fechaCompletada: new Date() 
        } 
      }
    );
  },

  // Eliminar tarea
  async eliminar(id) {
    const collection = obtenerCollection();
    return await collection.deleteOne({ _id: new ObjectId(id) });
  },

  // Buscar tareas por texto (búsqueda)
  async buscarPorTexto(texto) {
    const collection = obtenerCollection();
    return await collection.find({
      descripcion: { $regex: texto, $options: 'i' }
    }).sort({ completada: 1, fechaCreacion: -1 }).toArray();
  },

  // Obtener estadísticas usando agregación
  async obtenerEstadisticas() {
    const collection = obtenerCollection();
    
    const estadisticas = await collection.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completadas: {
            $sum: { $cond: ['$completada', 1, 0] }
          },
          pendientes: {
            $sum: { $cond: ['$completada', 0, 1] }
          }
        }
      }
    ]).toArray();

    return estadisticas[0] || { total: 0, completadas: 0, pendientes: 0 };
  },

  // Obtener última tarea completada
  async obtenerUltimaCompletada() {
    const collection = obtenerCollection();
    return await collection.findOne(
      { completada: true },
      { sort: { fechaCompletada: -1 } }
    );
  },

  // Obtener día más productivo
  async obtenerDiaMasProductivo() {
    const collection = obtenerCollection();
    
    const resultado = await collection.aggregate([
      {
        $group: {
          _id: { $dayOfWeek: '$fechaCreacion' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]).toArray();

    return resultado[0] || null;
  },

  // Contar documentos
  async contar(filtro = {}) {
    const collection = obtenerCollection();
    return await collection.countDocuments(filtro);
  },

  // Función helper para escapar caracteres regex
  escaparRegex(texto) {
    return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
};