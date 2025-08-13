# MANUAL TÉCNICO - SISTEMA EVA

## Equipos y Vidas Aseguradas

**Versión:** 1.0  
**Fecha:** 13 de Agosto, 2025  
**Dirigido a:** Desarrolladores y Administradores del Sistema  
**Arquitectura:** Laravel 12 + React 18 + MySQL 8.0+

---

## 📖 ÍNDICE

1. [Introducción Técnica](#introducción-técnica)
2. [Estructura del Código](#estructura-del-código)
3. [Configuración del Entorno de Desarrollo](#configuración-del-entorno-de-desarrollo)
4. [Scripts de Instalación y Migraciones](#scripts-de-instalación-y-migraciones)
5. [Procedimientos de Mantenimiento y Actualización](#procedimientos-de-mantenimiento-y-actualización)
6. [Arquitectura del Sistema](#arquitectura-del-sistema)
7. [APIs y Endpoints](#apis-y-endpoints)
8. [Base de Datos](#base-de-datos)
9. [Seguridad y Autenticación](#seguridad-y-autenticación)
10. [Monitoreo y Logs](#monitoreo-y-logs)
11. [Troubleshooting Técnico](#troubleshooting-técnico)
12. [Anexos Técnicos](#anexos-técnicos)

---

## 🔧 INTRODUCCIÓN TÉCNICA

### Descripción General

EVA es un sistema de gestión de equipos biomédicos desarrollado con arquitectura moderna de microservicios, diseñado para cumplir con regulaciones del sector salud colombiano y estándares internacionales.

### Stack Tecnológico Principal

#### **Backend**

- **Framework:** Laravel 12 (PHP 8.1+)
- **Base de Datos:** MySQL 8.0+ con InnoDB
- **API:** RESTful con autenticación JWT
- **Cache:** Redis para sesiones y cache de aplicación
- **Queue:** Laravel Queue con Redis driver

#### **Frontend**

- **Framework:** React 18 con TypeScript
- **Build Tool:** Vite 4.x
- **Styling:** Tailwind CSS 3.x
- **State Management:** Redux Toolkit
- **HTTP Client:** Axios

#### **DevOps y Infraestructura**

- **Containerización:** Docker + Docker Compose
- **Desarrollo:** Laravel Sail
- **CI/CD:** GitHub Actions
- **Servidor Web:** Nginx
- **Monitoreo:** ELK Stack (Elasticsearch, Logstash, Kibana)

### Arquitectura General

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTE NAVEGADOR                    │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTPS
┌─────────────────────▼───────────────────────────────────┐
│                   NGINX REVERSE PROXY                  │
└─────────────────────┬───────────────────────────────────┘
                      │
          ┌───────────┴──────────┐
          │                      │
┌─────────▼─────────┐   ┌────────▼────────┐
│   FRONTEND REACT  │   │  BACKEND LARAVEL│
│   (Puerto 3000)   │   │   (Puerto 8000) │
└─────────┬─────────┘   └────────┬────────┘
          │                      │
          └──────────┬───────────┘
                     │ API REST
┌────────────────────▼────────────────────┐
│              BASE DE DATOS              │
│            MySQL 8.0 + Redis           │
└─────────────────────────────────────────┘
```

---

## 📁 ESTRUCTURA DEL CÓDIGO

### Organización del Proyecto

```
proyecto-eva/
├── eva-backend/                    # API Laravel
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/        # Controladores de API
│   │   │   ├── Middleware/         # Middleware personalizado
│   │   │   └── Requests/           # Form Requests de validación
│   │   ├── Models/                 # Modelos Eloquent
│   │   ├── Services/               # Lógica de negocio
│   │   └── Traits/                 # Traits reutilizables
│   ├── config/                     # Configuración del sistema
│   ├── database/
│   │   ├── migrations/             # Migraciones de BD
│   │   ├── seeders/                # Datos iniciales
│   │   └── factories/              # Factories para testing
│   ├── routes/
│   │   ├── api.php                 # Rutas de API
│   │   └── web.php                 # Rutas web
│   ├── storage/
│   │   ├── app/documents/          # Documentos subidos
│   │   └── logs/                   # Logs del sistema
│   └── tests/                      # Tests automatizados
├── eva-frontend/                   # SPA React
│   ├── src/
│   │   ├── components/             # Componentes React
│   │   │   ├── common/             # Componentes comunes
│   │   │   ├── equipment/          # Componentes de equipos
│   │   │   ├── forms/              # Formularios
│   │   │   └── layout/             # Layout y navegación
│   │   ├── hooks/                  # Custom React Hooks
│   │   ├── pages/                  # Páginas/Vistas principales
│   │   ├── services/               # Servicios API
│   │   ├── store/                  # Redux store
│   │   ├── types/                  # Definiciones TypeScript
│   │   └── utils/                  # Utilidades y helpers
│   ├── public/                     # Archivos estáticos
│   └── tests/                      # Tests frontend
├── docker/                         # Configuración Docker
│   ├── nginx/                      # Configuración Nginx
│   ├── mysql/                      # Scripts BD iniciales
│   └── php/                        # Configuración PHP
└── docs/                           # Documentación técnica
```

### Estructura Backend Detallada

#### **app/Http/Controllers/**

```php
Controllers/
├── API/
│   ├── EquipmentController.php     # CRUD equipos médicos
│   ├── DocumentController.php      # Gestión documentos
│   ├── MaintenanceController.php   # Mantenimiento/calibración
│   ├── ReportController.php        # Generación reportes
│   └── UserController.php          # Gestión usuarios
├── Auth/
│   ├── AuthController.php          # Autenticación JWT
│   ├── PasswordController.php      # Recuperación contraseñas
│   └── RegisterController.php      # Registro usuarios
└── Admin/
    ├── AdminController.php         # Panel administración
    ├── ConfigController.php        # Configuración sistema
    └── AuditController.php         # Auditoría y logs
```

#### **app/Models/**

```php
Models/
├── Equipment.php                   # Modelo principal equipos
├── Document.php                    # Documentos adjuntos
├── Maintenance.php                 # Mantenimientos
├── Service.php                     # Servicios hospitalarios
├── User.php                        # Usuarios del sistema
├── Role.php                        # Roles y permisos
├── AuditLog.php                    # Logs de auditoría
└── Setting.php                     # Configuración sistema
```

#### **app/Services/**

```php
Services/
├── EquipmentService.php            # Lógica de negocio equipos
├── DocumentService.php             # Procesamiento documentos
├── InvimaService.php               # Integración API INVIMA
├── ReportService.php               # Generación reportes
├── NotificationService.php         # Sistema notificaciones
└── ValidationService.php           # Validaciones complejas
```

### Estructura Frontend Detallada

#### **src/components/**

```typescript
components/
├── common/
│   ├── Button.tsx                  # Botón reutilizable
│   ├── Input.tsx                   # Input con validación
│   ├── Modal.tsx                   # Modal genérico
│   ├── Table.tsx                   # Tabla con paginación
│   └── LoadingSpinner.tsx          # Indicador de carga
├── equipment/
│   ├── EquipmentForm.tsx           # Formulario registro
│   ├── EquipmentList.tsx           # Lista de equipos
│   ├── EquipmentSearch.tsx         # Búsqueda avanzada
│   └── EquipmentCard.tsx           # Tarjeta de equipo
├── layout/
│   ├── Header.tsx                  # Cabecera principal
│   ├── Sidebar.tsx                 # Menú lateral
│   ├── Footer.tsx                  # Pie de página
│   └── MainLayout.tsx              # Layout principal
└── forms/
    ├── FormField.tsx               # Campo de formulario
    ├── Validation.tsx              # Componente validación
    └── FileUpload.tsx              # Subida archivos
```

#### **src/services/**

```typescript
services/
├── api.ts                          # Cliente Axios configurado
├── equipmentService.ts             # API equipos
├── documentService.ts              # API documentos
├── authService.ts                  # API autenticación
├── userService.ts                  # API usuarios
└── reportService.ts                # API reportes
```

---

## ⚙️ CONFIGURACIÓN DEL ENTORNO DE DESARROLLO

### Prerrequisitos del Sistema

#### **Software Requerido**

- **Docker Desktop:** 4.15+ con Docker Compose V2
- **Git:** 2.30+
- **Node.js:** 18+ con npm 8+
- **PHP:** 8.1+ (opcional, si no usa Docker)
- **Composer:** 2.4+ (opcional, si no usa Docker)

#### **IDE Recomendado**

- **VSCode** con extensiones:
  - PHP Intelephense
  - Laravel Extension Pack
  - React/TypeScript extensions
  - Docker
  - GitLens

### Configuración Inicial del Proyecto

#### **1. Clonar el Repositorio**

```bash
# Clonar desde GitHub
git clone https://github.com/kamdevo/proyecto-eva.git
cd proyecto-eva
```

#### **2. Configuración Docker (Recomendado)**

**docker-compose.yml:**

```yaml
version: "3.8"

services:
  app:
    build:
      context: .
      dockerfile: docker/php/Dockerfile
    container_name: eva-backend
    volumes:
      - ./eva-backend:/var/www/html
      - ./storage/logs:/var/www/html/storage/logs
    environment:
      - DB_HOST=mysql
      - DB_DATABASE=eva_database
      - DB_USERNAME=eva_user
      - DB_PASSWORD=eva_password
    depends_on:
      - mysql
      - redis

  nginx:
    image: nginx:alpine
    container_name: eva-nginx
    ports:
      - "8000:80"
      - "3000:3000"
    volumes:
      - ./eva-backend:/var/www/html
      - ./docker/nginx/default.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - app

  mysql:
    image: mysql:8.0
    container_name: eva-mysql
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: eva_database
      MYSQL_USER: eva_user
      MYSQL_PASSWORD: eva_password
    volumes:
      - mysql_data:/var/lib/mysql
      - ./docker/mysql/init:/docker-entrypoint-initdb.d
    ports:
      - "3306:3306"

  redis:
    image: redis:alpine
    container_name: eva-redis
    ports:
      - "6379:6379"

  frontend:
    build:
      context: ./eva-frontend
      dockerfile: Dockerfile.dev
    container_name: eva-frontend
    volumes:
      - ./eva-frontend:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:8000/api/v1

volumes:
  mysql_data:
```

#### **3. Configuración Backend Laravel**

**eva-backend/.env:**

```bash
APP_NAME=EVA
APP_ENV=local
APP_KEY=base64:generated_key_here
APP_DEBUG=true
APP_URL=http://localhost:8000

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=eva_database
DB_USERNAME=eva_user
DB_PASSWORD=eva_password

CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

REDIS_HOST=redis
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_TTL=480

# INVIMA API
INVIMA_API_URL=https://api.invima.gov.co
INVIMA_API_KEY=your_invima_api_key

# File Storage
FILESYSTEM_DISK=local
MAX_FILE_SIZE=10240

# Application Settings
EQUIPMENT_CODE_PREFIX=EQ
DOCUMENT_RETENTION_DAYS=2555
```

**Comandos de Configuración:**

```bash
# Entrar al contenedor backend
docker exec -it eva-backend bash

# Instalar dependencias
composer install

# Generar key de aplicación
php artisan key:generate

# Generar JWT secret
php artisan jwt:secret

# Ejecutar migraciones
php artisan migrate

# Poblar base de datos
php artisan db:seed

# Crear link simbólico para storage
php artisan storage:link

# Limpiar cache
php artisan cache:clear
php artisan config:clear
```

#### **4. Configuración Frontend React**

**eva-frontend/.env:**

```bash
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_FILE_UPLOAD_URL=http://localhost:8000/api/v1/documents/upload
REACT_APP_MAX_FILE_SIZE=10485760
REACT_APP_SUPPORTED_FORMATS=pdf,doc,docx,jpg,png,xlsx
REACT_APP_VERSION=1.0.0
REACT_APP_BUILD_DATE=2025-08-13
```

**Comandos de Configuración:**

```bash
# Entrar al directorio frontend
cd eva-frontend

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Generar build de producción
npm run build

# Ejecutar tests
npm test

# Linting y formato
npm run lint
npm run format
```

---

## 🚀 SCRIPTS DE INSTALACIÓN Y MIGRACIONES

### Scripts de Instalación Automatizada

#### **1. Script Principal de Instalación**

**install.sh:**

```bash
#!/bin/bash

# EVA System Installation Script
# Version: 1.0
# Date: 2025-08-13

set -e

echo "🏥 Iniciando instalación del Sistema EVA..."

# Verificar prerrequisitos
check_prerequisites() {
    echo "📋 Verificando prerrequisitos..."

    if ! command -v docker &> /dev/null; then
        echo "❌ Docker no está instalado"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose no está instalado"
        exit 1
    fi

    if ! command -v git &> /dev/null; then
        echo "❌ Git no está instalado"
        exit 1
    fi

    echo "✅ Prerrequisitos verificados"
}

# Configurar entorno
setup_environment() {
    echo "⚙️  Configurando entorno..."

    # Crear directorios necesarios
    mkdir -p storage/logs
    mkdir -p storage/app/documents
    mkdir -p storage/app/backups

    # Permisos para Docker
    chmod -R 775 storage
    chmod -R 775 eva-backend/storage

    # Copiar archivos de configuración
    if [ ! -f eva-backend/.env ]; then
        cp eva-backend/.env.example eva-backend/.env
        echo "📝 Archivo .env creado en backend"
    fi

    if [ ! -f eva-frontend/.env ]; then
        cp eva-frontend/.env.example eva-frontend/.env
        echo "📝 Archivo .env creado en frontend"
    fi
}

# Generar claves y configuración
generate_keys() {
    echo "🔐 Generando claves de seguridad..."

    # Generar APP_KEY para Laravel
    docker-compose run --rm app php artisan key:generate

    # Generar JWT Secret
    docker-compose run --rm app php artisan jwt:secret

    echo "✅ Claves generadas exitosamente"
}

# Instalar dependencias
install_dependencies() {
    echo "📦 Instalando dependencias..."

    # Backend
    echo "🔧 Instalando dependencias backend..."
    docker-compose run --rm app composer install --optimize-autoloader

    # Frontend
    echo "🔧 Instalando dependencias frontend..."
    docker-compose run --rm frontend npm install

    echo "✅ Dependencias instaladas"
}

# Configurar base de datos
setup_database() {
    echo "🗄️  Configurando base de datos..."

    # Esperar a que MySQL esté listo
    echo "⏳ Esperando conexión a MySQL..."
    sleep 30

    # Ejecutar migraciones
    docker-compose run --rm app php artisan migrate --force

    # Poblar con datos iniciales
    docker-compose run --rm app php artisan db:seed --force

    # Crear link simbólico
    docker-compose run --rm app php artisan storage:link

    echo "✅ Base de datos configurada"
}

# Construir frontend
build_frontend() {
    echo "🏗️  Construyendo frontend..."

    docker-compose run --rm frontend npm run build

    echo "✅ Frontend construido"
}

# Función principal
main() {
    check_prerequisites

    echo "🐳 Iniciando contenedores Docker..."
    docker-compose up -d

    setup_environment
    install_dependencies
    generate_keys
    setup_database
    build_frontend

    echo ""
    echo "🎉 ¡Instalación completada exitosamente!"
    echo ""
    echo "📍 URLs de acceso:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:8000/api/v1"
    echo "   Documentación API: http://localhost:8000/api/documentation"
    echo ""
    echo "👤 Credenciales por defecto:"
    echo "   Usuario: admin@hospital.com"
    echo "   Contraseña: Eva2025!"
    echo ""
    echo "🔧 Para detener el sistema: docker-compose down"
    echo "🔧 Para reiniciar: docker-compose restart"
}

# Ejecutar función principal
main "$@"
```

#### **2. Migraciones de Base de Datos**

**database/migrations/2025_08_13_000001_create_equipments_table.php:**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('equipments', function (Blueprint $table) {
            $table->id();
            $table->string('codigo_unico')->unique();
            $table->string('nombre_equipo');
            $table->string('marca');
            $table->string('modelo');
            $table->string('numero_serie')->nullable();
            $table->year('año_fabricacion');

            // Especificaciones técnicas
            $table->enum('clase_riesgo', ['I', 'IIa', 'IIb', 'III']);
            $table->string('tecnologia_biomedica');
            $table->text('uso_previsto');
            $table->string('voltaje_operacion')->nullable();
            $table->string('potencia')->nullable();
            $table->decimal('peso', 8, 2)->nullable();
            $table->string('dimensiones')->nullable();

            // Ubicación y responsables
            $table->foreignId('propietario_id')->constrained('users');
            $table->foreignId('servicio_id')->constrained('services');
            $table->string('area_especifica')->nullable();
            $table->foreignId('responsable_id')->constrained('users');
            $table->foreignId('usuario_actual_id')->nullable()->constrained('users');

            // Estado y fechas
            $table->enum('estado_equipo', [
                'operativo', 'mantenimiento', 'fuera_servicio',
                'dado_baja', 'en_transito', 'en_instalacion'
            ])->default('operativo');

            $table->date('fecha_adquisicion')->nullable();
            $table->date('fecha_instalacion')->nullable();
            $table->date('fecha_puesta_servicio')->nullable();

            // Información regulatoria
            $table->string('codigo_invima')->nullable();
            $table->date('fecha_vencimiento_invima')->nullable();
            $table->boolean('requiere_calibracion')->default(false);
            $table->integer('frecuencia_calibracion_meses')->nullable();
            $table->date('ultima_calibracion')->nullable();
            $table->date('proxima_calibracion')->nullable();

            // Información comercial
            $table->string('proveedor')->nullable();
            $table->decimal('valor_adquisicion', 15, 2)->nullable();
            $table->string('moneda', 3)->default('COP');
            $table->text('observaciones')->nullable();

            // Metadatos
            $table->boolean('activo')->default(true);
            $table->json('metadata')->nullable();
            $table->timestamps();

            // Índices
            $table->index(['estado_equipo']);
            $table->index(['servicio_id']);
            $table->index(['propietario_id']);
            $table->index(['codigo_invima']);
            $table->index(['activo']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('equipments');
    }
};
```

---

## 🔧 PROCEDIMIENTOS DE MANTENIMIENTO Y ACTUALIZACIÓN

### Mantenimiento Preventivo

#### **1. Tareas Diarias Automatizadas**

**app/Console/Kernel.php:**

```php
protected function schedule(Schedule $schedule)
{
    // Backup diario de la base de datos
    $schedule->command('backup:database')
             ->daily()
             ->at('02:00')
             ->environments(['production']);

    // Limpieza de logs antiguos
    $schedule->command('log:clear')
             ->daily()
             ->at('03:00');

    // Verificación de equipos vencidos
    $schedule->command('equipment:check-expiry')
             ->daily()
             ->at('08:00');

    // Sincronización con INVIMA
    $schedule->command('invima:sync')
             ->daily()
             ->at('06:00')
             ->environments(['production']);

    // Envío de notificaciones pendientes
    $schedule->command('notifications:send')
             ->everyFifteenMinutes();

    // Limpieza de archivos temporales
    $schedule->command('files:cleanup')
             ->weekly()
             ->sundays()
             ->at('01:00');
}
```

#### **2. Script de Monitoreo de Salud**

**health-check.sh:**

```bash
#!/bin/bash

# EVA Health Check Script
# Version: 1.0

# Configuración
API_URL="http://localhost:8000/api/v1"
FRONTEND_URL="http://localhost:3000"
ALERT_EMAIL="admin@hospital.com"
LOG_FILE="logs/health-check.log"

# Función de logging
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# Verificar API Backend
check_api() {
    local endpoint="$API_URL/health"
    local response=$(curl -s -o /dev/null -w "%{http_code}" $endpoint)

    if [ "$response" = "200" ]; then
        log_message "✅ API Backend: OK"
        return 0
    else
        log_message "❌ API Backend: FAIL (HTTP $response)"
        return 1
    fi
}

# Verificar Base de Datos
check_database() {
    local result=$(docker-compose exec -T mysql mysql \
        -u eva_user -peva_password \
        -e "SELECT 1" eva_database 2>/dev/null)

    if [ $? -eq 0 ]; then
        log_message "✅ Base de Datos: OK"
        return 0
    else
        log_message "❌ Base de Datos: FAIL"
        return 1
    fi
}

# Verificar espacio en disco
check_disk_space() {
    local used_space=$(df -h . | awk 'NR==2 {print $5}' | sed 's/%//')

    if [ $used_space -lt 90 ]; then
        log_message "✅ Espacio en Disco: OK ($used_space%)"
        return 0
    else
        log_message "⚠️  Espacio en Disco: ADVERTENCIA ($used_space%)"
        return 1
    fi
}

# Función principal
main() {
    log_message "🔍 Iniciando verificación de salud del sistema..."

    local failed_checks=0
    local warnings=0

    # Ejecutar todas las verificaciones
    check_api || ((failed_checks++))
    check_database || ((failed_checks++))
    check_disk_space || ((warnings++))

    # Evaluar resultados
    if [ $failed_checks -eq 0 ] && [ $warnings -eq 0 ]; then
        log_message "🎉 Todos los sistemas funcionando correctamente"
    elif [ $failed_checks -eq 0 ] && [ $warnings -gt 0 ]; then
        log_message "⚠️  Sistema funcionando con advertencias ($warnings)"
    else
        log_message "❌ Fallos críticos detectados ($failed_checks)"
    fi

    log_message "📊 Verificación completada"
}

main "$@"
```

### Procedimientos de Actualización

#### **Script de Actualización**

**update.sh:**

```bash
#!/bin/bash

# EVA System Update Script
# Version: 1.0

set -e

echo "🔄 Iniciando actualización del Sistema EVA..."

# Función de backup
create_backup() {
    echo "💾 Creando backup de la base de datos..."

    BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="backup_eva_${BACKUP_DATE}.sql"

    docker-compose exec mysql mysqldump \
        -u eva_user -peva_password eva_database > \
        storage/app/backups/${BACKUP_FILE}

    echo "✅ Backup creado: ${BACKUP_FILE}"
}

# Actualizar código
update_code() {
    echo "📥 Descargando últimos cambios..."

    git fetch origin
    git pull origin implementation-testing

    echo "✅ Código actualizado"
}

# Actualizar dependencias
update_dependencies() {
    echo "📦 Actualizando dependencias..."

    # Backend
    docker-compose run --rm app composer update

    # Frontend
    docker-compose run --rm frontend npm update

    echo "✅ Dependencias actualizadas"
}

# Ejecutar migraciones
run_migrations() {
    echo "🗄️  Ejecutando migraciones..."

    docker-compose run --rm app php artisan migrate --force

    echo "✅ Migraciones ejecutadas"
}

# Limpiar cache
clear_cache() {
    echo "🧹 Limpiando cache..."

    docker-compose run --rm app php artisan cache:clear
    docker-compose run --rm app php artisan config:clear
    docker-compose run --rm app php artisan route:clear
    docker-compose run --rm app php artisan view:clear

    echo "✅ Cache limpiado"
}

# Función principal
main() {
    create_backup
    update_code
    update_dependencies
    run_migrations
    clear_cache

    echo "🔄 Reiniciando servicios..."
    docker-compose restart app frontend

    echo ""
    echo "🎉 ¡Actualización completada exitosamente!"
}

main "$@"
```

---

## 📊 ARQUITECTURA DEL SISTEMA

### Patrones de Diseño Implementados

#### **1. Repository Pattern (Backend)**

```php
// app/Repositories/EquipmentRepository.php
interface EquipmentRepositoryInterface
{
    public function find(int $id): ?Equipment;
    public function findByCode(string $code): ?Equipment;
    public function create(array $data): Equipment;
    public function update(int $id, array $data): Equipment;
    public function delete(int $id): bool;
    public function search(array $filters): Collection;
}

class EquipmentRepository implements EquipmentRepositoryInterface
{
    public function find(int $id): ?Equipment
    {
        return Equipment::find($id);
    }

    public function search(array $filters): Collection
    {
        $query = Equipment::query();

        if (isset($filters['code'])) {
            $query->where('codigo_unico', 'like', "%{$filters['code']}%");
        }

        if (isset($filters['service_id'])) {
            $query->where('servicio_id', $filters['service_id']);
        }

        return $query->with(['service', 'documents'])->get();
    }
}
```

#### **2. Service Layer Pattern**

```php
// app/Services/EquipmentService.php
class EquipmentService
{
    public function __construct(
        private EquipmentRepositoryInterface $equipmentRepository,
        private DocumentService $documentService,
        private ValidationService $validationService
    ) {}

    public function createEquipment(array $data): Equipment
    {
        // Validar datos
        $this->validationService->validateEquipmentData($data);

        // Generar código único si no se proporciona
        if (!isset($data['codigo_unico'])) {
            $data['codigo_unico'] = $this->generateUniqueCode();
        }

        // Crear equipo
        $equipment = $this->equipmentRepository->create($data);

        // Procesar documentos si los hay
        if (isset($data['documents'])) {
            $this->documentService->attachDocuments($equipment, $data['documents']);
        }

        return $equipment;
    }

    private function generateUniqueCode(): string
    {
        $prefix = config('equipment.code_prefix', 'EQ');
        $lastEquipment = Equipment::latest('id')->first();
        $nextNumber = $lastEquipment ? $lastEquipment->id + 1 : 1;

        return $prefix . str_pad($nextNumber, 6, '0', STR_PAD_LEFT);
    }
}
```

### Comunicación Frontend-Backend

#### **1. API Client (Frontend)**

```typescript
// src/services/api.ts
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: process.env.REACT_APP_API_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor para JWT
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("authToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor para manejo de errores
    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("authToken");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<T>(url, config);
    return response.data;
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.instance.post<T>(url, data, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
```

#### **2. Equipment Service (Frontend)**

```typescript
// src/services/equipmentService.ts
import { apiClient } from "./api";
import {
  Equipment,
  EquipmentFilters,
  CreateEquipmentData,
} from "../types/equipment";

export class EquipmentService {
  static async getEquipments(filters?: EquipmentFilters): Promise<Equipment[]> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          params.append(key, value.toString());
        }
      });
    }

    return apiClient.get<Equipment[]>(`/equipments?${params.toString()}`);
  }

  static async createEquipment(data: CreateEquipmentData): Promise<Equipment> {
    return apiClient.post<Equipment>("/equipments", data);
  }

  static async updateEquipment(
    id: number,
    data: Partial<Equipment>
  ): Promise<Equipment> {
    return apiClient.put<Equipment>(`/equipments/${id}`, data);
  }

  static async deleteEquipment(id: number): Promise<void> {
    return apiClient.delete(`/equipments/${id}`);
  }
}
```

---

## 🔒 SEGURIDAD Y AUTENTICACIÓN

### Sistema de Autenticación JWT

#### **Backend - Configuración JWT**

```php
// config/jwt.php
return [
    'secret' => env('JWT_SECRET'),
    'keys' => [
        'public' => env('JWT_PUBLIC_KEY'),
        'private' => env('JWT_PRIVATE_KEY'),
        'passphrase' => env('JWT_PASSPHRASE'),
    ],
    'ttl' => env('JWT_TTL', 480), // 8 horas
    'refresh_ttl' => env('JWT_REFRESH_TTL', 20160), // 2 semanas
    'algo' => env('JWT_ALGO', 'HS256'),
];
```

#### **AuthController**

```php
// app/Http/Controllers/Auth/AuthController.php
class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();

        if (!$token = auth()->attempt($credentials)) {
            return response()->json([
                'error' => 'Credenciales inválidas'
            ], 401);
        }

        $user = auth()->user();

        // Registrar login en auditoría
        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'login',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth()->factory()->getTTL() * 60,
            'user' => new UserResource($user)
        ]);
    }

    public function logout()
    {
        auth()->logout();

        return response()->json([
            'message' => 'Sesión cerrada exitosamente'
        ]);
    }

    public function refresh()
    {
        return response()->json([
            'access_token' => auth()->refresh(),
            'token_type' => 'bearer',
            'expires_in' => auth()->factory()->getTTL() * 60
        ]);
    }
}
```

### Middleware de Seguridad

#### **Rate Limiting**

```php
// app/Http/Middleware/CustomRateLimiter.php
class CustomRateLimiter
{
    public function handle(Request $request, Closure $next, $maxAttempts = 60, $decayMinutes = 1)
    {
        $key = $this->resolveRequestSignature($request);
        $maxAttempts = $this->resolveMaxAttempts($request, $maxAttempts);

        if ($this->limiter->tooManyAttempts($key, $maxAttempts)) {
            event(new Lockout($request));

            return $this->buildException($key, $maxAttempts);
        }

        $this->limiter->hit($key, $decayMinutes * 60);

        $response = $next($request);

        return $this->addHeaders(
            $response, $maxAttempts,
            $this->calculateRemainingAttempts($key, $maxAttempts)
        );
    }
}
```

#### **CORS Configuration**

```php
// config/cors.php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:3000'),
        env('APP_URL', 'http://localhost:8000')
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

---

## 📋 APIS Y ENDPOINTS

### Documentación de Endpoints Principales

#### **1. Autenticación**

```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@hospital.com",
  "password": "password123"
}

Response:
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 28800,
  "user": {
    "id": 1,
    "name": "Usuario Ejemplo",
    "email": "user@hospital.com",
    "roles": ["usuario"]
  }
}
```

#### **2. Equipos**

```
GET /api/v1/equipments
Authorization: Bearer {token}
Query Params:
  - code: string (código único)
  - service_id: integer
  - status: string
  - page: integer
  - per_page: integer (max 100)

Response:
{
  "data": [
    {
      "id": 1,
      "codigo_unico": "EQ000001",
      "nombre_equipo": "Monitor de Signos Vitales",
      "marca": "Phillips",
      "modelo": "MX800",
      "estado_equipo": "operativo",
      "service": {
        "id": 1,
        "nombre": "UCI"
      },
      "documents_count": 5,
      "created_at": "2025-08-13T10:00:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "total": 1247,
    "per_page": 15
  }
}
```

```
POST /api/v1/equipments
Authorization: Bearer {token}
Content-Type: application/json

{
  "codigo_unico": "EQ000002",
  "nombre_equipo": "Ventilador Mecánico",
  "marca": "Dräger",
  "modelo": "Evita V500",
  "numero_serie": "ABC123456",
  "año_fabricacion": 2024,
  "clase_riesgo": "IIb",
  "tecnologia_biomedica": "Equipo de soporte vital",
  "uso_previsto": "Ventilación mecánica para pacientes críticos",
  "propietario_id": 1,
  "servicio_id": 1,
  "responsable_id": 2,
  "estado_equipo": "operativo"
}

Response: 201 Created
{
  "id": 2,
  "codigo_unico": "EQ000002",
  "nombre_equipo": "Ventilador Mecánico",
  "created_at": "2025-08-13T10:15:00Z"
}
```

#### **3. Documentos**

```
POST /api/v1/documents/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

equipment_id: 1
tipo_documento: manual_usuario
titulo: Manual de Usuario Phillips MX800
descripcion: Manual completo del equipo
file: [archivo PDF]

Response: 201 Created
{
  "id": 1,
  "titulo": "Manual de Usuario Phillips MX800",
  "nombre_archivo": "manual_phillips_mx800.pdf",
  "tamaño_archivo": 2048576,
  "mime_type": "application/pdf",
  "ruta_descarga": "/api/v1/documents/1/download"
}
```

#### **4. Reportes**

```
POST /api/v1/reports/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "tipo_reporte": "inventario_general",
  "formato": "pdf",
  "filtros": {
    "servicio_id": 1,
    "estado": "operativo",
    "fecha_desde": "2025-01-01",
    "fecha_hasta": "2025-08-13"
  }
}

Response: 202 Accepted
{
  "job_id": "report_12345",
  "status": "processing",
  "estimated_completion": "2025-08-13T10:20:00Z",
  "download_url": "/api/v1/reports/download/report_12345"
}
```

### Códigos de Estado HTTP

| Código | Descripción           | Uso                                          |
| ------ | --------------------- | -------------------------------------------- |
| 200    | OK                    | Operación exitosa                            |
| 201    | Created               | Recurso creado exitosamente                  |
| 202    | Accepted              | Operación aceptada (procesamiento asíncrono) |
| 400    | Bad Request           | Datos de entrada inválidos                   |
| 401    | Unauthorized          | No autenticado                               |
| 403    | Forbidden             | Sin permisos                                 |
| 404    | Not Found             | Recurso no encontrado                        |
| 422    | Unprocessable Entity  | Errores de validación                        |
| 429    | Too Many Requests     | Rate limit excedido                          |
| 500    | Internal Server Error | Error del servidor                           |

---

## 📚 GLOSARIO DE TÉRMINOS

### **Términos Técnicos del Sistema EVA**

#### **A**

- **API (Application Programming Interface)**: Interfaz que permite la comunicación entre diferentes componentes del sistema EVA.
- **Autenticación JWT**: Sistema de tokens seguros basado en JSON Web Tokens para verificar la identidad de usuarios.

#### **B**

- **Biomedical Equipment**: Equipos médicos utilizados en el diagnóstico, tratamiento o monitoreo de pacientes.
- **Backend**: Componente del servidor que maneja la lógica de negocio, base de datos y APIs del sistema EVA.

#### **C**

- **Calibración**: Proceso de ajuste y verificación de la precisión de equipos médicos según estándares establecidos.
- **CRUD**: Operaciones básicas de Create (Crear), Read (Leer), Update (Actualizar), Delete (Eliminar) en base de datos.

#### **D**

- **Docker**: Plataforma de containerización utilizada para el despliegue del sistema EVA.
- **Documentación Técnica**: Conjunto de manuales, especificaciones y procedimientos del equipo médico.

#### **E**

- **Equipo Biomédico**: Dispositivo, instrumento, aparato o accesorio utilizado en medicina para diagnóstico, tratamiento o rehabilitación.
- **EVA (Equipos y Vidas Aseguradas)**: Sistema de gestión integral de equipos biomédicos hospitalarios.

#### **F**

- **Frontend**: Interfaz de usuario desarrollada en React que permite la interacción con el sistema EVA.
- **Framework Laravel**: Plataforma de desarrollo PHP utilizada para construir el backend del sistema.

#### **G**

- **Gestión de Inventario**: Proceso de control y seguimiento de equipos médicos en la institución hospitalaria.

#### **H**

- **Hoja de Vida del Equipo**: Registro histórico completo de mantenimientos, calibraciones y eventos del equipo médico.

#### **I**

- **INVIMA**: Instituto Nacional de Vigilancia de Medicamentos y Alimentos de Colombia, entidad reguladora de equipos médicos.
- **IPS**: Institución Prestadora de Servicios de Salud.

#### **J**

- **JWT (JSON Web Token)**: Estándar abierto para transmitir información de forma segura entre sistemas.

#### **L**

- **Laravel**: Framework de desarrollo web en PHP utilizado para el backend del sistema EVA.
- **Logs de Auditoría**: Registros detallados de todas las acciones realizadas en el sistema para trazabilidad.

#### **M**

- **Mantenimiento Preventivo**: Actividades programadas para prevenir fallas en equipos médicos.
- **Middleware**: Componente que intercepta y procesa solicitudes HTTP en el sistema.

#### **N**

- **Normalización**: Proceso de cumplimiento con estándares y regulaciones aplicables a equipos médicos.

#### **O**

- **ORM (Object-Relational Mapping)**: Técnica de programación para convertir datos entre sistemas incompatibles usando Eloquent en Laravel.

#### **P**

- **Plan de Mantenimiento**: Cronograma estructurado de actividades de mantenimiento para equipos médicos.

#### **R**

- **React**: Biblioteca de JavaScript utilizada para construir la interfaz de usuario del sistema EVA.
- **REST API**: Interfaz de programación que utiliza protocolos HTTP para comunicación entre sistemas.
- **Registro Sanitario**: Autorización expedida por INVIMA para comercializar equipos médicos en Colombia.

#### **S**

- **SPA (Single Page Application)**: Aplicación web que carga una sola página HTML y actualiza dinámicamente el contenido.
- **Sistema de Calidad**: Conjunto de procesos y procedimientos para garantizar la calidad en la gestión de equipos médicos.

#### **T**

- **Trazabilidad**: Capacidad de rastrear el historial completo de un equipo médico desde su adquisición hasta su baja.
- **TypeScript**: Lenguaje de programación que extiende JavaScript con tipado estático.

#### **V**

- **Validación**: Proceso de verificación de que un equipo médico cumple con especificaciones y requisitos establecidos.
- **Vida Útil**: Período estimado durante el cual un equipo médico puede operar de manera segura y eficaz.

---

## 📖 REFERENCIAS Y DOCUMENTACIÓN EXTERNA

### **Normatividad Colombiana**

#### **INVIMA (Instituto Nacional de Vigilancia de Medicamentos y Alimentos)**

- **Decreto 4725 de 2005**: Régimen de registros sanitarios, permiso de comercialización y vigilancia sanitaria de los dispositivos médicos para uso humano.
  - URL: https://www.invima.gov.co/normatividad-dispositivos-medicos
- **Resolución 2434 de 2006**: Manual de tecnovigilancia de dispositivos médicos para uso humano.
  - URL: https://www.invima.gov.co/tecnovigilancia-dispositivos-medicos
- **Circular Externa 002 de 2017**: Lineamientos para el funcionamiento de los establecimientos que comercializan dispositivos médicos.

#### **Ministerio de Salud y Protección Social**

- **Resolución 2003 de 2014**: Procedimientos y condiciones de inscripción de los prestadores de servicios de salud y de habilitación de servicios de salud.
  - URL: https://www.minsalud.gov.co/Normatividad_Nuevo/Resoluci%C3%B3n%202003%20de%202014.pdf
- **Decreto 780 de 2016**: Decreto Único Reglamentario del Sector Salud y Protección Social.

### **Normatividad Internacional**

#### **ISO (International Organization for Standardization)**

- **ISO 13485:2016**: Sistemas de gestión de la calidad para dispositivos médicos.
  - URL: https://www.iso.org/standard/59752.html
- **ISO 14971:2019**: Aplicación de la gestión de riesgos a los dispositivos médicos.
  - URL: https://www.iso.org/standard/72704.html
- **ISO 62304:2006**: Software de dispositivos médicos - Procesos del ciclo de vida del software.

#### **IEC (International Electrotechnical Commission)**

- **IEC 60601-1:2012**: Equipos electromédicos - Requisitos generales para la seguridad básica y funcionamiento esencial.
  - URL: https://webstore.iec.ch/publication/2606
- **IEC 62366-1:2015**: Dispositivos médicos - Aplicación de la ingeniería de usabilidad a los dispositivos médicos.

#### **FDA (Food and Drug Administration)**

- **21 CFR Part 820**: Quality System Regulation para dispositivos médicos.
  - URL: https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfcfr/CFRSearch.cfm?CFRPart=820
- **Guidance Documents**: Documentos de orientación para el desarrollo y validación de software médico.

### **Estándares de Tecnología**

#### **Laravel Framework**

- **Documentación Oficial de Laravel 12**: https://laravel.com/docs/12.x
- **Laravel API Resources**: https://laravel.com/docs/12.x/eloquent-resources
- **Laravel Authentication**: https://laravel.com/docs/12.x/authentication
- **Laravel Testing**: https://laravel.com/docs/12.x/testing

#### **React y TypeScript**

- **Documentación de React 18**: https://react.dev/learn
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Redux Toolkit**: https://redux-toolkit.js.org/introduction/getting-started
- **Vite Build Tool**: https://vitejs.dev/guide/

#### **Docker y DevOps**

- **Docker Documentation**: https://docs.docker.com/
- **Docker Compose**: https://docs.docker.com/compose/
- **MySQL 8.0 Documentation**: https://dev.mysql.com/doc/refman/8.0/en/
- **Redis Documentation**: https://redis.io/documentation

### **Manuales de Buenas Prácticas**

#### **Gestión de Equipos Biomédicos**

- **WHO Medical Device Regulations**: Global Overview and Guiding Principles
  - URL: https://www.who.int/publications/i/item/9789241515405
- **PAHO Guidelines**: Mantenimiento y gestión de equipos médicos
  - URL: https://www.paho.org/hq/dmdocuments/2015/mantenimiento-equipos-medicos.pdf

#### **Seguridad de la Información en Salud**

- **HIPAA Security Rule**: Estándares de seguridad para información de salud
  - URL: https://www.hhs.gov/hipaa/for-professionals/security/index.html
- **ISO 27001:2013**: Sistemas de gestión de seguridad de la información
  - URL: https://www.iso.org/standard/54534.html

#### **Desarrollo de Software Médico**

- **IEC 82304-1:2016**: Health software - General requirements for product safety
- **AAMI TIR36:2013**: Validation of software for regulated processes
- **GAMP 5**: Good Automated Manufacturing Practice guide for validation of computerized systems

### **Recursos Técnicos Adicionales**

#### **APIs y Integraciones**

- **FHIR (Fast Healthcare Interoperability Resources)**: https://www.hl7.org/fhir/
- **JWT.io**: Herramientas para trabajar con JSON Web Tokens: https://jwt.io/
- **Postman API Testing**: https://learning.postman.com/docs/getting-started/introduction/

#### **Herramientas de Desarrollo**

- **VS Code Extensions**: Recomendaciones para desarrollo con Laravel y React
- **Git Best Practices**: https://git-scm.com/doc
- **GitHub Actions**: https://docs.github.com/en/actions

### **Contactos y Soporte Técnico**

#### **Entidades Regulatorias**

- **INVIMA Colombia**:
  - Teléfono: (+57) 1 2948700
  - Email: invima@invima.gov.co
  - Web: https://www.invima.gov.co

#### **Soporte Técnico EVA**

- **Equipo de Desarrollo**: developers@eva-system.com
- **Soporte al Usuario**: support@eva-system.com
- **Documentación**: https://docs.eva-system.com

---

_Manual Técnico EVA v1.0_  
_Última actualización: 13 de Agosto, 2025_  
_© 2025 EVA Corp. Todos los derechos reservados_

---

**🏥 Sistema EVA - Equipos y Vidas Aseguradas**  
_"Documentación técnica para desarrolladores y administradores"_
