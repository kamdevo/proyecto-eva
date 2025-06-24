<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Mapeo Completo de Tablas de Base de Datos
    |--------------------------------------------------------------------------
    |
    | Este archivo contiene el mapeo correcto entre las tablas reales de la BD
    | y los modelos Laravel. Corrige inconsistencias de nombres español/inglés.
    |
    */

    // Mapeo de tablas principales
    'tables' => [
        // TABLAS PRINCIPALES (Correctas)
        'equipos' => 'equipos',
        'areas' => 'areas', 
        'servicios' => 'servicios',
        'propietarios' => 'propietarios',
        'usuarios' => 'usuarios',
        'contingencias' => 'contingencias',
        'mantenimiento' => 'mantenimiento',
        'observaciones' => 'observaciones',
        'archivos' => 'archivos',
        'roles' => 'roles',
        'empresas' => 'empresas',
        'contacto' => 'contacto',
        'guias_rapidas' => 'guias_rapidas',
        'planes_mantenimientos' => 'planes_mantenimientos',
        'ordenes_compra' => 'ordenes_compra',
        'repuestos' => 'repuestos',
        'manuales' => 'manuales',
        'calibracion' => 'calibracion',
        'bajas' => 'bajas',
        'movimientos' => 'movimientos',
        'permisos' => 'permisos',
        'sedes' => 'sedes',
        'pisos' => 'pisos',
        'zonas' => 'zonas',
        'estados' => 'estados',
        'tipos' => 'tipos',
        'procesos' => 'procesos',
        'subprocesos' => 'subprocesos',
        'centros' => 'centros',
        'paises' => 'paises',
        'menus' => 'menus',
        'modulos' => 'modulos',

        // TABLAS CON NOMBRES ABREVIADOS (Problemáticas)
        'cbiomedica' => 'cbiomedica', // clasificacion_biomedica
        'criesgo' => 'criesgo', // clasificacion_riesgo  
        'fuenteal' => 'fuenteal', // fuente_alimentacion
        'tecnologiap' => 'tecnologiap', // tecnologia
        'frecuenciam' => 'frecuenciam', // frecuencia_mantenimiento
        'estadoequipos' => 'estadoequipos', // estado_equipos
        'estadosm' => 'estadosm', // estados_mantenimiento
        'tadquisicion' => 'tadquisicion', // tipo_adquisicion
        'tcontacto' => 'tcontacto', // tipo_contacto

        // TABLAS ESPECÍFICAS
        'equipo_archivo' => 'equipo_archivo',
        'equipo_contacto' => 'equipo_contacto',
        'equipo_especificacion' => 'equipo_especificacion',
        'equipo_repuestos' => 'equipo_repuestos',
        'equipos_bajas' => 'equipos_bajas',
        'equipos_excluidos_guias' => 'equipos_excluidos_guias',
        'equipos_indicador' => 'equipos_indicador',
        'equipos_industriales' => 'equipos_industriales',
        'equipos_manuales' => 'equipos_manuales',
        'listado_industriales' => 'listado_industriales',
        'servicios_industriales' => 'servicios_industriales',
        'usuarios_zonas' => 'usuarios_zonas',

        // TABLAS DE MANTENIMIENTO
        'mantenimiento_ind' => 'mantenimiento_ind',
        'calibracion_ind' => 'calibracion_ind',
        'correctivos_generales' => 'correctivos_generales',
        'correctivos_generales_archivos' => 'correctivos_generales_archivos',
        'correctivos_generales_archivos_ind' => 'correctivos_generales_archivos_ind',
        'correctivos_generales_ind' => 'correctivos_generales_ind',
        'avances_correctivos' => 'avances_correctivos',
        'proveedores_mantenimiento' => 'proveedores_mantenimiento',
        'vigencias_mantenimiento' => 'vigencias_mantenimiento',

        // TABLAS DE CONTROL
        'cambios_cronograma' => 'cambios_cronograma',
        'cambios_hdv' => 'cambios_hdv',
        'cambios_ubicaciones' => 'cambios_ubicaciones',
        'codificacion_cierres' => 'codificacion_cierres',
        'codificacion_diagnosticos' => 'codificacion_diagnosticos',

        // TABLAS DE CONSULTAS Y REPORTES
        'consultas_guias_rapidas' => 'consultas_guias_rapidas',
        'guias_rapidas_indicador' => 'guias_rapidas_indicador',
        'estados_excluidos_guias' => 'estados_excluidos_guias',
        'riesgos_incluidos_guias' => 'riesgos_incluidos_guias',

        // TABLAS DE ARCHIVOS Y OBSERVACIONES
        'observaciones_archivos' => 'observaciones_archivos',

        // TABLAS DE ÓRDENES Y COMPRAS
        'ordenes' => 'ordenes',
        'tipos_compra' => 'tipos_compra',
        'periodos_garantias' => 'periodos_garantias',

        // TABLAS DE REPUESTOS
        'repuestos_pendientes' => 'repuestos_pendientes',
        'repuestos_ti' => 'repuestos_ti',

        // TABLAS DE TIPOS Y ESTADOS
        'tipos_estados' => 'tipos_estados',
        'tipos_fallas' => 'tipos_fallas',

        // TABLAS DE TRABAJO
        'trabajos' => 'trabajos',
        'tecnicos' => 'tecnicos',
        'pruebas' => 'pruebas',
        'acciones' => 'acciones',
        'invimas' => 'invimas',
        'especificacion' => 'especificacion',

        // TABLA DE TOKENS
        'personal_access_tokens' => 'personal_access_tokens',
    ],

    // Mapeo de modelos a tablas
    'models' => [
        'Equipo' => 'equipos',
        'Area' => 'areas',
        'Servicio' => 'servicios', 
        'Propietario' => 'propietarios',
        'Usuario' => 'usuarios',
        'Contingencia' => 'contingencias',
        'Mantenimiento' => 'mantenimiento',
        'Observacion' => 'observaciones',
        'Archivo' => 'archivos',
        'Rol' => 'roles',
        'Empresa' => 'empresas',
        'Contacto' => 'contacto',
        'GuiaRapida' => 'guias_rapidas',
        'PlanMantenimiento' => 'planes_mantenimientos',
        'OrdenCompra' => 'ordenes_compra',
        'Repuesto' => 'repuestos',
        'Manual' => 'manuales',
        'Calibracion' => 'calibracion',
        'Baja' => 'bajas',
        'Movimiento' => 'movimientos',
        'Permiso' => 'permisos',
        'Sede' => 'sedes',
        'Piso' => 'pisos',
        'Zona' => 'zonas',
        'Estado' => 'estados',
        'Tipo' => 'tipos',
        'Proceso' => 'procesos',
        'Subproceso' => 'subprocesos',
        'Centro' => 'centros',
        'Pais' => 'paises',
        'Menu' => 'menus',
        'Modulo' => 'modulos',

        // Modelos con nombres abreviados
        'ClasificacionBiomedica' => 'cbiomedica',
        'ClasificacionRiesgo' => 'criesgo',
        'FuenteAlimentacion' => 'fuenteal',
        'Tecnologia' => 'tecnologiap',
        'FrecuenciaMantenimiento' => 'frecuenciam',
        'EstadoEquipo' => 'estadoequipos',
        'EstadoMantenimiento' => 'estadosm',
        'TipoAdquisicion' => 'tadquisicion',
        'TipoContacto' => 'tcontacto',
    ],

    // Campos que usan 'nombre' vs 'name'
    'name_fields' => [
        'areas' => 'nombre',
        'servicios' => 'nombre', 
        'propietarios' => 'nombre',
        'cbiomedica' => 'nombre',
        'criesgo' => 'nombre',
        'fuenteal' => 'nombre',
        'tecnologiap' => 'nombre',
        'frecuenciam' => 'nombre',
        'estadoequipos' => 'nombre',
        'estadosm' => 'nombre',
        'tadquisicion' => 'nombre',
        'tcontacto' => 'nombre',
        'tipos' => 'nombre',
        'estados' => 'nombre',
        'roles' => 'nombre',
        'empresas' => 'nombre',
        'sedes' => 'nombre',
        'pisos' => 'nombre',
        'zonas' => 'nombre',
        'centros' => 'nombre',
        'procesos' => 'nombre',
        'subprocesos' => 'nombre',
        
        // Excepciones que usan 'name'
        'equipos' => 'name',
        'usuarios' => 'nombre', // Pero también tiene 'apellido'
    ],

    // Campos de estado/activo
    'status_fields' => [
        'equipos' => 'status', // 1/0
        'usuarios' => 'estado', // 1/0
        'contingencias' => 'estado_id', // FK a tabla estados
        'areas' => 'status', // 1/0
        'servicios' => 'status', // 1/0
        'propietarios' => 'activo', // boolean
    ],

    // Relaciones problemáticas que necesitan corrección
    'problematic_relations' => [
        'ControladorEquipos.php' => [
            'lines' => '46-50',
            'issue' => 'Usa name en lugar de nombre para relaciones',
            'fix' => 'Cambiar name por nombre en with()'
        ],
        'ControladorMantenimiento.php' => [
            'lines' => '31-35', 
            'issue' => 'Usa name en lugar de nombre para relaciones',
            'fix' => 'Cambiar name por nombre en with()'
        ],
        'EquipmentController.php' => [
            'lines' => '38-49',
            'issue' => 'Usa name en lugar de nombre para relaciones',
            'fix' => 'Cambiar name por nombre en with()'
        ]
    ]

];
