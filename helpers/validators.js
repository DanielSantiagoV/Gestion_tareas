import _ from 'lodash';

export function validarDescripcionTarea(descripcion) {
  if (_.isEmpty(descripcion) || _.isEmpty(descripcion.trim())) {
    return {
      valido: false,
      mensaje: 'La descripción de la tarea no puede estar vacía'
    };
  }

  if (descripcion.trim().length < 3) {
    return {
      valido: false,
      mensaje: 'La descripción debe tener al menos 3 caracteres'
    };
  }

  if (descripcion.trim().length > 200) {
    return {
      valido: false,
      mensaje: 'La descripción no puede tener más de 200 caracteres'
    };
  }

  return {
    valido: true,
    mensaje: 'Descripción válida'
  };
}

export function limpiarTexto(texto) {
  return _.trim(texto);
}