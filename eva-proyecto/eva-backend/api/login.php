<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../db/conexion.php';

class LoginController
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
        $this->handleRequest();
    }

    private function handleRequest()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->respond(false, 'Método no permitido');
        }

        $username = $_POST['username'] ?? '';
        $password = $_POST['password'] ?? '';

        if (empty($username) || empty($password)) {
            $this->respond(false, 'Usuario y contraseña requeridos');
        }

        try {
            $stmt = $this->pdo->prepare("SELECT * FROM usuarios WHERE username = :username AND estado = 1 LIMIT 1");
            $stmt->execute(['username' => $username]);
            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$usuario) {
                $this->respond(false, 'Usuario no encontrado o inactivo');
            }

            $hashBD = $usuario['password'];

            if (password_verify($password, $hashBD)) {
                $this->respondSuccess($usuario);
            } elseif (sha1($password) === $hashBD) {
                // Migrar contraseña a password_hash automáticamente
                $nuevoHash = password_hash($password, PASSWORD_DEFAULT);
                $update = $this->pdo->prepare("UPDATE usuarios SET password = :newHash WHERE id = :id");
                $update->execute(['newHash' => $nuevoHash, 'id' => $usuario['id']]);

                $this->respondSuccess($usuario, 'Contraseña actualizada a formato seguro');
            } else {
                $this->respond(false, 'Contraseña incorrecta');
            }
        } catch (PDOException $e) {
            $this->respond(false, 'Error en base de datos: ' . $e->getMessage());
        }
    }

    private function respond($success, $message)
    {
        echo json_encode(['success' => $success, 'message' => $message]);
        exit;
    }

    private function respondSuccess($usuario, $mensajeExtra = '')
    {
        echo json_encode([
            'success' => true,
            'message' => 'Inicio de sesión exitoso. ' . $mensajeExtra,
            'nombre' => $usuario['username'],
            'rol' => $usuario['rol_id'] ?? null,
            'id_usuario' => $usuario['id']
        ]);
        exit;
    }
}

// Ejecutar controlador
new LoginController($pdo);
