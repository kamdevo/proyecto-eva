Descripción General
El sistema implementa una clasificación estructurada para diferenciar y organizar los equipos según su naturaleza, uso y características técnicas. Esta clasificación facilita la gestión, mantenimiento y seguimiento de los equipos, permitiendo aplicar protocolos específicos según el tipo de equipo.

Clasificación Principal por Sector

1. Equipos Industriales
   Los equipos industriales se clasifican según su función dentro de los procesos productivos y operativos de la organización.

Por Función Operativa:
Equipos de Producción: Maquinaria directamente involucrada en la fabricación
Equipos de Procesamiento: Sistemas que transforman materias primas
Equipos de Transporte: Sistemas de movimiento y traslado de materiales
Equipos de Almacenamiento: Sistemas para conservación y almacenaje
Equipos de Control de Calidad: Instrumentos de medición y verificación
Por Criticidad Operacional:
Críticos: Equipos cuya falla detiene la producción
Semi-críticos: Equipos importantes pero con respaldo disponible
No críticos: Equipos cuya falla no afecta significativamente la operación
Por Tipo de Mantenimiento:
Preventivo Programado: Equipos con mantenimiento calendarizado
Predictivo: Equipos monitoreados con sensores y análisis
Correctivo: Equipos que se reparan solo cuando fallan 2. Equipos Biomédicos
Los equipos biomédicos siguen clasificaciones específicas del sector salud, considerando su impacto en la seguridad del paciente y los procesos clínicos.

Por Clasificación de Riesgo (FDA/INVIMA):
Clase I (Bajo Riesgo): Equipos básicos con mínimo riesgo para el paciente
Clase IIa (Riesgo Moderado-Bajo): Equipos con contacto temporal con el paciente
Clase IIb (Riesgo Moderado-Alto): Equipos con contacto prolongado
Clase III (Alto Riesgo): Equipos de soporte vital o implantables
Por Función Clínica:
Diagnóstico: Equipos para identificar condiciones médicas
Terapéutico: Equipos para tratamiento de pacientes
Rehabilitación: Equipos para recuperación funcional
Monitoreo: Equipos para vigilancia continua de pacientes
Soporte Vital: Equipos críticos para mantener funciones vitales
Por Área de Aplicación:
Cuidados Intensivos: Equipos especializados para UCI
Quirófano: Equipos para procedimientos quirúrgicos
Laboratorio Clínico: Equipos de análisis y diagnóstico
Imagenología: Equipos de diagnóstico por imágenes
Rehabilitación: Equipos para fisioterapia y recuperación
Estructura de Clasificación en Base de Datos
Tablas Relacionadas con la Clasificación
Tabla: tipos_equipos
Columnas: id, nombre, descripcion, categoria_principal, subcategoria, nivel_criticidad
Función: Define los tipos generales de equipos
Tabla: categorias_equipos
Columnas: id, nombre, descripcion, sector, codigo_categoria, requiere_certificacion
Función: Establece las categorías principales (Industrial/Biomédico)
Tabla: subcategorias_equipos
Columnas: id, categoria_id, nombre, descripcion, codigo_subcategoria
Función: Define subdivisiones específicas dentro de cada categoría
Tabla: clasificacion_riesgo
Columnas: id, codigo_clase, nombre, descripcion, nivel_riesgo, sector_aplicable
Función: Específica para equipos biomédicos - clasificación de riesgo
Tabla: equipos_clasificacion
Columnas: id, equipo_id, tipo_equipo_id, categoria_id, subcategoria_id, clase_riesgo_id
Función: Relaciona cada equipo con su clasificación completa
Criterios de Clasificación Específicos
Para Equipos Industriales
Por Complejidad Tecnológica:
Básicos: Equipos mecánicos simples
Intermedios: Equipos con componentes eléctricos/electrónicos
Avanzados: Equipos con sistemas de control automatizado
Inteligentes: Equipos con IoT y sistemas predictivos
Por Ambiente de Operación:
Interior: Equipos para uso en ambientes controlados
Exterior: Equipos resistentes a condiciones ambientales
Ambientes Especiales: Equipos para áreas peligrosas o controladas
Por Fuente de Energía:
Eléctricos: Operan con energía eléctrica
Neumáticos: Operan con aire comprimido
Hidráulicos: Operan con sistemas de fluidos
Híbridos: Combinan múltiples fuentes de energía
Para Equipos Biomédicos
Por Normatividad Aplicable:
IEC 60601: Equipos electromédicos
ISO 13485: Sistemas de gestión de calidad para dispositivos médicos
ISO 14971: Gestión de riesgos para dispositivos médicos
Normas Locales: Regulaciones específicas del país
Por Método de Esterilización:
Autoclave: Equipos que requieren esterilización por vapor
Óxido de Etileno: Equipos sensibles al calor
Gamma: Equipos que requieren radiación
No requiere: Equipos que no necesitan esterilización
Por Frecuencia de Calibración:
Diaria: Equipos críticos que requieren verificación diaria
Semanal: Equipos de monitoreo continuo
Mensual: Equipos de diagnóstico estándar
Semestral: Equipos de soporte general
Anual: Equipos no críticos
Proceso de Clasificación

1. Evaluación Inicial
   Identificación del sector: Determinar si es industrial o biomédico
   Análisis de función: Definir el propósito principal del equipo
   Evaluación de riesgo: Determinar el nivel de criticidad
   Revisión normativa: Identificar regulaciones aplicables
2. Asignación de Categorías
   Categoría principal: Industrial o Biomédico
   Subcategoría: Según función específica
   Clase de riesgo: Para equipos biomédicos
   Nivel de criticidad: Para todos los equipos
3. Documentación y Registro
   Registro en sistema: Captura de toda la información de clasificación
   Generación de códigos: Asignación de códigos únicos según clasificación
   Vinculación con protocolos: Asociación con procedimientos específicos
   Actualización de inventario: Reflejo de la clasificación en el inventario
   Impacto de la Clasificación en la Gestión
   Mantenimiento Diferenciado
   Frecuencias específicas: Según criticidad y tipo de equipo
   Protocolos especializados: Procedimientos según clasificación
   Personal calificado: Asignación de técnicos especializados
   Documentación requerida: Registros específicos según normativa
   Gestión de Repuestos
   Inventario estratificado: Stock diferenciado según criticidad
   Proveedores especializados: Según tipo de equipo y certificaciones
   Tiempos de respuesta: Definidos según clasificación
   Validación de repuestos: Procesos específicos según normativa
   Reportes y Seguimiento
   Indicadores específicos: KPIs diferenciados por clasificación
   Reportes regulatorios: Específicos para equipos biomédicos
   Análisis de tendencias: Según tipo y clasificación de equipo
   Auditorías especializadas: Protocolos según sector y riesgo
