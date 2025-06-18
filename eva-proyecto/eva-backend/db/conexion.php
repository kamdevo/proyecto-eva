<?php
class Conexion
{
    private $host = 'localhost';
    private $db = 'gestionthuv';
    private $user = 'root';
    private $pass = '';
    private $charset = 'utf8mb4';
    private $pdo;
    private $log = [];

    public function __construct()
    {
        try {
            $dsn = "mysql:host={$this->host};dbname={$this->db};charset={$this->charset}";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ];

            $this->pdo = new PDO($dsn, $this->user, $this->pass, $options);
        } catch (PDOException $e) {
            $this->reportError("Fallo al conectar a la base de datos", $e);
            die(json_encode([
                'success' => false,
                'error_code' => 500,
                'message' => 'No se pudo establecer conexión con la base de datos.',
                'detalles' => $e->getMessage()
            ]));
        }
    }

    public function testConexion()
    {
        try {
            $this->pdo->query('SELECT 1');
            return ['success' => true, 'message' => 'Conexión exitosa con la base de datos.'];
        } catch (PDOException $e) {
            return $this->handleException($e, "Test de conexión fallido");
        }
    }

    public function listarTablas()
    {
        try {
            $stmt = $this->pdo->query("SHOW TABLES");
            return $stmt->fetchAll(PDO::FETCH_COLUMN);
        } catch (PDOException $e) {
            return $this->handleException($e, "Error al listar tablas.");
        }
    }

    public function obtenerDatos($tabla, $limit = 50)
    {
        try {
            $stmt = $this->pdo->prepare("SELECT * FROM `$tabla` LIMIT :limit");
            $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
            $stmt->execute();
            return ['success' => true, 'data' => $stmt->fetchAll()];
        } catch (PDOException $e) {
            return $this->handleException($e, "Error al obtener datos de $tabla.");
        }
    }

    public function insertar($tabla, $datos)
    {
        try {
            $campos = implode(", ", array_keys($datos));
            $placeholders = implode(", ", array_map(fn($k) => ":$k", array_keys($datos)));
            $sql = "INSERT INTO `$tabla` ($campos) VALUES ($placeholders)";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($datos);
            return ['success' => true, 'message' => 'Registro insertado con éxito'];
        } catch (PDOException $e) {
            return $this->handleException($e, "Error al insertar en $tabla.");
        }
    }

    public function actualizar($tabla, $datos, $condicion)
    {
        try {
            $campos = implode(", ", array_map(fn($k) => "$k = :$k", array_keys($datos)));
            $sql = "UPDATE `$tabla` SET $campos WHERE $condicion";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($datos);
            return ['success' => true, 'message' => 'Registro actualizado'];
        } catch (PDOException $e) {
            return $this->handleException($e, "Error al actualizar en $tabla.");
        }
    }

    public function eliminar($tabla, $condicion)
    {
        try {
            $sql = "DELETE FROM `$tabla` WHERE $condicion";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();
            return ['success' => true, 'message' => 'Registro eliminado'];
        } catch (PDOException $e) {
            return $this->handleException($e, "Error al eliminar en $tabla.");
        }
    }

 private function handleException($e, $contexto)
{
    $codigo = $e->getCode();
    $mensajeCrudo = $e->getMessage();

    $mensaje = match (true) {
        str_contains($mensajeCrudo, 'SQLSTATE[HY000] [1045]') => 'Error de autenticación: usuario o contraseña incorrecta.',
        str_contains($mensajeCrudo, 'SQLSTATE[HY000] [1049]') => 'Base de datos no encontrada.',
        str_contains($mensajeCrudo, 'SQLSTATE[HY000] [2002]') => 'No se puede conectar al servidor MySQL. Verifica si está activo.',
        str_contains($mensajeCrudo, 'SQLSTATE[HY000] [2003]') => 'Tiempo de espera agotado al intentar conexión.',
        str_contains($mensajeCrudo, 'SQLSTATE[HY000] [2006]') => 'Conexión al servidor MySQL se ha perdido.',
        str_contains($mensajeCrudo, 'SQLSTATE[42S02]') => 'Tabla o vista no encontrada en la base de datos.',
        str_contains($mensajeCrudo, 'SQLSTATE[42S22]') => 'Columna especificada no existe.',
        str_contains($mensajeCrudo, 'SQLSTATE[23000]') => 'Violación de restricción de integridad o clave duplicada.',
        str_contains($mensajeCrudo, 'Cannot delete or update a parent row') => 'No se puede borrar registro padre por clave foránea.',
        str_contains($mensajeCrudo, 'No database selected') => 'No se seleccionó una base de datos.',
        str_contains($mensajeCrudo, 'Access denied for user') => 'Permisos insuficientes para usuario.',
        str_contains($mensajeCrudo, 'could not find driver') => 'No se encontró el controlador PDO. Verifica extensión instalada.',
        str_contains($mensajeCrudo, 'server has gone away') => 'El servidor MySQL no está disponible.',
        str_contains($mensajeCrudo, 'MySQL server has gone away') => 'Conexión al servidor interrumpida.',
        str_contains($mensajeCrudo, 'already has more than') => 'Error por campo con longitud excesiva.',
        str_contains($mensajeCrudo, 'Incorrect string value') => 'Valor de texto contiene caracteres inválidos para codificación.',
        str_contains($mensajeCrudo, 'Deadlock found') => 'Interbloqueo detectado en base de datos.',
        str_contains($mensajeCrudo, 'Packets out of order') => 'Fallo en protocolo de comunicación entre cliente y servidor.',
        str_contains($mensajeCrudo, 'Commands out of sync') => 'Operaciones PDO ejecutadas fuera de orden.',
        str_contains($mensajeCrudo, 'Data too long for column') => 'Datos muy largos para el campo.',
        str_contains($mensajeCrudo, 'Out of range value for column') => 'Valor fuera de rango para tipo de dato.',
        str_contains($mensajeCrudo, 'Unknown column') => 'Se ha consultado una columna inexistente.',
        str_contains($mensajeCrudo, 'You have an error in your SQL syntax') => 'Error de sintaxis en la consulta SQL.',
        str_contains($mensajeCrudo, 'General error') => 'Error general en operación PDO.',
        str_contains($mensajeCrudo, 'Lock wait timeout exceeded') => 'Tiempo de espera agotado por bloqueo de tabla.',
        str_contains($mensajeCrudo, 'foreign key constraint fails') => 'Violación de clave foránea al insertar/actualizar.',
        str_contains($mensajeCrudo, 'syntax to use near') => 'Error de sintaxis cercano al texto especificado.',
        str_contains($mensajeCrudo, 'Truncated incorrect DOUBLE value') => 'Valor decimal mal formado.',
        str_contains($mensajeCrudo, 'Incorrect integer value') => 'Valor entero incorrecto.',
        str_contains($mensajeCrudo, 'cannot be null') => 'Campo no puede ser nulo.',
        str_contains($mensajeCrudo, 'Unknown database') => 'La base de datos especificada no existe.',
        str_contains($mensajeCrudo, 'Invalid default value') => 'Valor por defecto inválido para campo.',
        str_contains($mensajeCrudo, 'Division by 0') => 'División por cero en operación SQL.',
        str_contains($mensajeCrudo, 'has no default value') => 'Campo requerido no tiene valor por defecto.',
        str_contains($mensajeCrudo, 'Illegal mix of collations') => 'Problema de codificación o cotejamiento en la comparación.',
        str_contains($mensajeCrudo, 'wrong number of arguments') => 'Número incorrecto de argumentos en función SQL.',
        str_contains($mensajeCrudo, 'denied to user') => 'Permiso denegado al usuario para realizar esta acción.',
        str_contains($mensajeCrudo, 'key does not exist') => 'Índice o clave no existe en la tabla.',
        str_contains($mensajeCrudo, 'Lost connection during query') => 'Conexión perdida durante la consulta.',
        str_contains($mensajeCrudo, 'file not found') => 'Archivo requerido por operación SQL no encontrado.',
        str_contains($mensajeCrudo, 'Query was empty') => 'La consulta enviada está vacía.',
        str_contains($mensajeCrudo, 'Incorrect date value') => 'Formato de fecha incorrecto.',
        str_contains($mensajeCrudo, 'Operand should contain') => 'Subconsulta devuelve múltiples resultados no válidos.',
        str_contains($mensajeCrudo, 'Illegal parameter number') => 'Error en la cantidad de parámetros pasados a consulta.',
        str_contains($mensajeCrudo, 'Error while sending') => 'Error de red al enviar datos.',
        str_contains($mensajeCrudo, 'SSL connection error') => 'Error de conexión segura SSL con la base de datos.',
        str_contains($mensajeCrudo, 'Too many connections') => 'Límite máximo de conexiones al servidor alcanzado.',
        str_contains($mensajeCrudo, 'not unique') => 'Intento de inserción de valor duplicado en clave única.',
        str_contains($mensajeCrudo, 'Memory allocation error') => 'Error en asignación de memoria para operación.',
        str_contains($mensajeCrudo, 'Illegal mix of collations') => 'Conflicto entre conjuntos de caracteres.',
        str_contains($mensajeCrudo, 'mysqli_fetch_array() expects parameter') => 'Error al recorrer resultado de consulta.',
        str_contains($mensajeCrudo, 'mysqli_num_rows() expects') => 'Error al contar filas de resultado.',
        str_contains($mensajeCrudo, 'unable to prepare statement') => 'No se pudo preparar sentencia SQL.',
        str_contains($mensajeCrudo, 'unknown system variable') => 'Variable de sistema desconocida.',
        str_contains($mensajeCrudo, 'Unknown error') => 'Error desconocido sin descripción clara.',
        str_contains($mensajeCrudo, 'Error reading result set') => 'Error al leer el conjunto de resultados.',
        str_contains($mensajeCrudo, 'invalid use of group function') => 'Uso incorrecto de funciones agregadas.',
        str_contains($mensajeCrudo, 'Subquery returns more than 1 row') => 'Subconsulta devuelve múltiples resultados donde no debería.',
        str_contains($mensajeCrudo, 'No connection could be made') => 'No se pudo establecer conexión con el servidor.',
        str_contains($mensajeCrudo, 'parse error') => 'Error de análisis SQL o PHP.',
        str_contains($mensajeCrudo, 'invalid data source name') => 'Nombre de fuente de datos inválido.',
        str_contains($mensajeCrudo, 'incorrect format parameter') => 'Formato incorrecto en datos enviados.',
        str_contains($mensajeCrudo, 'unrecognized token') => 'Token no reconocido por el motor de SQL.',
        str_contains($mensajeCrudo, 'Connection refused') => 'Conexión rechazada. Verifica configuración.',
        str_contains($mensajeCrudo, 'Host is blocked') => 'Host bloqueado por exceso de errores.',
        str_contains($mensajeCrudo, 'Table storage engine') => 'Motor de almacenamiento no compatible.',
        str_contains($mensajeCrudo, 'Incorrect table definition') => 'Definición de tabla errónea.',
        str_contains($mensajeCrudo, 'You can\'t specify target table') => 'Tabla de destino no puede estar en subconsulta.',
        default => 'Error no clasificado: ' . $mensajeCrudo,
    };

    // Log opcional (puede usar Monolog, Laravel log, o error_log)
    error_log("[$contexto] [$codigo] $mensajeCrudo");

    return [
        'success' => false,
        'codigo' => $codigo,
        'error' => $mensaje,
        'contexto' => $contexto,
    ];
}

        $this->reportError($contexto, $e);
        return [
            'success' => false,
            'error_code' => $codigo,
            'message' => $mensaje,
            'detalles' => $e->getMessage()
        ];
    }

    private function reportError($contexto, $e)
    {
        error_log("[$contexto] Código: {$e->getCode()} - {$e->getMessage()} en {$e->getFile()}:{$e->getLine()}");
    }
}
