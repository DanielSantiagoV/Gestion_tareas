import chalk from 'chalk';

export function formatearTarea(tarea, indice) {
  const numero = chalk.cyan(`${indice + 1}.`);
  const estado = tarea.completada 
    ? chalk.green('✅') 
    : chalk.red('❌');
  const descripcion = tarea.completada 
    ? chalk.strikethrough.gray(tarea.descripcion) 
    : chalk.white(tarea.descripcion);
  
  const fecha = tarea.completada && tarea.fechaCompletada
    ? chalk.dim(` (completada: ${tarea.fechaCompletada.toLocaleDateString()})`)
    : '';

  return `${numero} [${estado}] ${descripcion}${fecha}`;
}

export function mostrarTitulo(titulo) {
  console.log('\n' + chalk.blue.bold('='.repeat(50)));
  console.log(chalk.blue.bold(`📋 ${titulo}`));
  console.log(chalk.blue.bold('='.repeat(50)));
}

export function mostrarMensajeExito(mensaje) {
  console.log(chalk.green.bold(`✅ ${mensaje}`));
}

export function mostrarMensajeError(mensaje) {
  console.log(chalk.red.bold(`❌ ${mensaje}`));
}

export function mostrarMensajeAdvertencia(mensaje) {
  console.log(chalk.yellow.bold(`⚠️ ${mensaje}`));
}

export function mostrarMensajeInfo(mensaje) {
  console.log(chalk.blue.bold(`ℹ️ ${mensaje}`));
}