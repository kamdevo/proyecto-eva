El modal de "Correctivos Generales" es una interfaz que permite a los usuarios visualizar, buscar y exportar el listado de correctivos registrados en el sistema. Este componente está diseñado para facilitar la gestión y el seguimiento de las acciones correctivas aplicadas a los equipos, proporcionando acceso rápido a la información relevante y herramientas para su análisis.

Funcionalidades Principales

1. Listado de Correctivos
   Muestra una tabla con el listado de correctivos generales registrados.
   Cada fila representa un correctivo y muestra información relevante extraída de la base de datos.
   Las columnas principales que se visualizan incluyen:
   ID del correctivo
   Fecha de registro
   Equipo asociado
   Descripción del correctivo
   Estado del correctivo
   Responsable
   Fecha de cierre (si aplica)
   Observaciones
   Tablas y Columnas Relacionadas
   Tabla principal: correctivos_generales
   Columnas: id, fecha_registro, id_equipo, descripcion, estado, responsable, fecha_cierre, observaciones
   Tabla de equipos: equipos
   Columnas: id, nombre, ubicacion, tipo
   Tabla de usuarios: usuarios
   Columnas: id, nombre, rol
2. Búsqueda Global
   Permite filtrar el listado de correctivos mediante un campo de búsqueda.
   El usuario puede buscar por cualquier término relacionado con los datos mostrados (por ejemplo, nombre de equipo, responsable, estado, etc.).
   La búsqueda se realiza sobre todas las columnas visibles en la tabla.
3. Exportación de Datos
   Ofrece la opción de exportar el listado de correctivos a un archivo (generalmente en formato Excel o CSV).
   La exportación incluye todas las filas y columnas actualmente visibles y filtradas por la búsqueda global.
   Permite a los usuarios analizar la información fuera del sistema y compartirla con otros departamentos.
4. Paginación y Ordenamiento
   El listado soporta paginación para facilitar la navegación cuando hay muchos registros.
   Las columnas pueden ordenarse ascendente o descendente para mejorar la visualización de los datos.
5. Acciones sobre Correctivos
   El modal puede incluir botones para ver detalles, editar o eliminar un correctivo, dependiendo de los permisos del usuario.
   Estas acciones interactúan con las tablas mencionadas y actualizan los registros correspondientes.
   Resumen de Tablas y Columnas Clave
   correctivos_generales: Registro principal de correctivos.
   equipos: Información del equipo relacionado con el correctivo.
   usuarios: Datos del responsable y otros usuarios involucrados.
