
# Simulador interactivo de asignación de espacio en disco

Este proyecto corresponde a una implementación web de un simulador para apoyar el estudio de conceptos de sistemas operativos, especialmente los relacionados con:

- Gestión de memoria.
- Planificación de CPU.
- Comparación entre políticas de scheduling.
- Asignación de espacio en disco.

La interfaz está diseñada para que el usuario pueda experimentar con distintos escenarios y visualizar cómo cambian los resultados según la estrategia seleccionada.

## ¿Qué incluye?

- Módulos interactivos para memoria, CPU expulsiva, CPU no expulsiva, comparación y disco.
- Visualización de resultados en tablas, diagramas y trazas.
- Simulaciones editables con procesos y parámetros configurables.

## Requisitos

- Node.js 18 o superior
- npm

## Instalación

```bash
npm install
```

## Ejecución en desarrollo

```bash
npm run dev
```

Abre la URL que proporcione Vite en tu navegador para ver el simulador.

## Compilación para producción

```bash
npm run build
```

Los archivos listos para publicar se generarán en la carpeta dist/.

## Estructura del proyecto

- index.html: entrada principal de la aplicación.
- src/simulator.css: estilos del simulador.
- src/simulator.js: lógica y comportamiento interactivo.

## Nota

Este proyecto fue organizado para que la página principal quede más limpia, mantenible y lista para ser usada como parte del repositorio correspondiente.
  