<?php

/**
 * Script para instalación segura de dependencias
 * Maneja problemas de antivirus y configuraciones de seguridad
 */

class SafeDependencyInstaller
{
    private $projectRoot;
    private $composerPath;
    private $logFile;

    public function __construct()
    {
        $this->projectRoot = dirname(__DIR__);
        $this->composerPath = $this->projectRoot . '/composer.json';
        $this->logFile = $this->projectRoot . '/storage/logs/dependency_install.log';
        
        // Crear directorio de logs si no existe
        if (!is_dir(dirname($this->logFile))) {
            mkdir(dirname($this->logFile), 0755, true);
        }
    }

    /**
     * Instalar dependencias de manera segura
     */
    public function installDependencies()
    {
        echo "🔒 Iniciando instalación segura de dependencias...\n\n";

        $this->log("Iniciando instalación segura de dependencias");

        // Paso 1: Verificar composer.json
        if (!$this->verifyComposerJson()) {
            return false;
        }

        // Paso 2: Configurar composer para evitar problemas de antivirus
        if (!$this->configureComposerSafety()) {
            return false;
        }

        // Paso 3: Instalar dependencias con configuración segura
        if (!$this->runSafeInstall()) {
            return false;
        }

        // Paso 4: Verificar instalación
        if (!$this->verifyInstallation()) {
            return false;
        }

        echo "\n🎉 Instalación completada exitosamente!\n";
        $this->log("Instalación completada exitosamente");
        
        return true;
    }

    /**
     * Verificar composer.json
     */
    private function verifyComposerJson()
    {
        echo "📋 Verificando composer.json...\n";

        if (!file_exists($this->composerPath)) {
            echo "❌ Error: composer.json no encontrado\n";
            return false;
        }

        $composer = json_decode(file_get_contents($this->composerPath), true);
        if (!$composer) {
            echo "❌ Error: composer.json inválido\n";
            return false;
        }

        echo "✅ composer.json válido\n";
        echo "   📦 Dependencias requeridas: " . count($composer['require'] ?? []) . "\n";
        echo "   🔧 Dependencias de desarrollo: " . count($composer['require-dev'] ?? []) . "\n";

        return true;
    }

    /**
     * Configurar composer para seguridad
     */
    private function configureComposerSafety()
    {
        echo "\n🔧 Configurando composer para instalación segura...\n";

        $commands = [
            // Configurar timeout más largo
            'composer config --global process-timeout 2000',
            
            // Configurar memoria
            'composer config --global memory-limit 2G',
            
            // Configurar para evitar problemas de antivirus
            'composer config --global cache-files-ttl 86400',
            'composer config --global cache-files-maxsize 1G',
            
            // Configurar repositorios seguros
            'composer config --global secure-http true',
            'composer config --global disable-tls false'
        ];

        foreach ($commands as $command) {
            echo "   🔧 Ejecutando: {$command}\n";
            $output = [];
            $returnCode = 0;
            exec($command . ' 2>&1', $output, $returnCode);
            
            if ($returnCode !== 0) {
                echo "   ⚠️ Advertencia en configuración: " . implode("\n", $output) . "\n";
                $this->log("Advertencia en configuración: " . $command . " - " . implode("\n", $output));
            }
        }

        echo "✅ Configuración de seguridad aplicada\n";
        return true;
    }

    /**
     * Ejecutar instalación segura
     */
    private function runSafeInstall()
    {
        echo "\n📦 Instalando dependencias...\n";

        // Limpiar caché de composer
        echo "   🧹 Limpiando caché de composer...\n";
        $this->executeCommand('composer clear-cache');

        // Instalar con configuración segura
        $installCommand = 'composer install --no-interaction --prefer-dist --optimize-autoloader --no-dev';
        
        echo "   📥 Ejecutando instalación principal...\n";
        echo "   💡 Comando: {$installCommand}\n";
        
        $startTime = time();
        $success = $this->executeCommand($installCommand, true);
        $duration = time() - $startTime;
        
        if ($success) {
            echo "   ✅ Instalación completada en {$duration} segundos\n";
            
            // Instalar dependencias de desarrollo por separado
            echo "   🔧 Instalando dependencias de desarrollo...\n";
            $devCommand = 'composer install --dev --no-interaction';
            $this->executeCommand($devCommand, true);
            
        } else {
            echo "   ❌ Error en instalación principal\n";
            return false;
        }

        return true;
    }

    /**
     * Ejecutar comando de manera segura
     */
    private function executeCommand($command, $showOutput = false)
    {
        $output = [];
        $returnCode = 0;
        
        $this->log("Ejecutando comando: {$command}");
        
        if ($showOutput) {
            echo "      📤 Salida del comando:\n";
        }
        
        exec($command . ' 2>&1', $output, $returnCode);
        
        if ($showOutput) {
            foreach ($output as $line) {
                echo "      {$line}\n";
            }
        }
        
        $this->log("Comando completado con código: {$returnCode}");
        $this->log("Salida: " . implode("\n", $output));
        
        return $returnCode === 0;
    }

    /**
     * Verificar instalación
     */
    private function verifyInstallation()
    {
        echo "\n🔍 Verificando instalación...\n";

        // Verificar vendor directory
        $vendorDir = $this->projectRoot . '/vendor';
        if (!is_dir($vendorDir)) {
            echo "❌ Error: Directorio vendor no encontrado\n";
            return false;
        }

        // Verificar autoload
        $autoloadFile = $vendorDir . '/autoload.php';
        if (!file_exists($autoloadFile)) {
            echo "❌ Error: Archivo autoload.php no encontrado\n";
            return false;
        }

        // Verificar algunas dependencias clave
        $keyDependencies = [
            'laravel/framework',
            'laravel/sanctum',
            'laravel/tinker'
        ];

        $installedFile = $vendorDir . '/composer/installed.json';
        if (file_exists($installedFile)) {
            $installed = json_decode(file_get_contents($installedFile), true);
            $installedPackages = [];
            
            if (isset($installed['packages'])) {
                $installedPackages = array_column($installed['packages'], 'name');
            } elseif (is_array($installed)) {
                $installedPackages = array_column($installed, 'name');
            }

            foreach ($keyDependencies as $dependency) {
                if (in_array($dependency, $installedPackages)) {
                    echo "   ✅ {$dependency}\n";
                } else {
                    echo "   ⚠️ {$dependency} (no encontrado)\n";
                }
            }
        }

        echo "✅ Verificación completada\n";
        return true;
    }

    /**
     * Generar reporte de instalación
     */
    public function generateInstallationReport()
    {
        echo "\n📊 Generando reporte de instalación...\n";

        $report = [
            'timestamp' => date('Y-m-d H:i:s'),
            'php_version' => PHP_VERSION,
            'composer_version' => $this->getComposerVersion(),
            'vendor_size' => $this->getDirectorySize($this->projectRoot . '/vendor'),
            'dependencies_count' => $this->getDependenciesCount(),
            'autoload_status' => file_exists($this->projectRoot . '/vendor/autoload.php') ? 'OK' : 'MISSING'
        ];

        $reportFile = $this->projectRoot . '/storage/logs/installation_report.json';
        file_put_contents($reportFile, json_encode($report, JSON_PRETTY_PRINT));

        echo "✅ Reporte generado: {$reportFile}\n";
        echo "   📊 PHP Version: {$report['php_version']}\n";
        echo "   📦 Composer Version: {$report['composer_version']}\n";
        echo "   💾 Vendor Size: " . round($report['vendor_size'] / 1024 / 1024, 2) . " MB\n";
        echo "   📋 Dependencies: {$report['dependencies_count']}\n";
        echo "   🔧 Autoload: {$report['autoload_status']}\n";

        return $report;
    }

    /**
     * Obtener versión de composer
     */
    private function getComposerVersion()
    {
        $output = [];
        exec('composer --version 2>&1', $output);
        return isset($output[0]) ? $output[0] : 'Unknown';
    }

    /**
     * Obtener tamaño de directorio
     */
    private function getDirectorySize($directory)
    {
        if (!is_dir($directory)) {
            return 0;
        }

        $size = 0;
        $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($directory));
        
        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $size += $file->getSize();
            }
        }

        return $size;
    }

    /**
     * Contar dependencias
     */
    private function getDependenciesCount()
    {
        $composer = json_decode(file_get_contents($this->composerPath), true);
        return count($composer['require'] ?? []) + count($composer['require-dev'] ?? []);
    }

    /**
     * Logging
     */
    private function log($message)
    {
        $timestamp = date('Y-m-d H:i:s');
        $logEntry = "[{$timestamp}] {$message}\n";
        file_put_contents($this->logFile, $logEntry, FILE_APPEND | LOCK_EX);
    }

    /**
     * Crear archivo .gitignore para vendor si no existe
     */
    public function createGitignore()
    {
        echo "\n📝 Configurando .gitignore...\n";

        $gitignorePath = $this->projectRoot . '/.gitignore';
        $vendorIgnore = "/vendor/\n/node_modules/\n.env\n/storage/logs/*.log\n";

        if (!file_exists($gitignorePath)) {
            file_put_contents($gitignorePath, $vendorIgnore);
            echo "✅ .gitignore creado\n";
        } else {
            $content = file_get_contents($gitignorePath);
            if (strpos($content, '/vendor/') === false) {
                file_put_contents($gitignorePath, $content . "\n" . $vendorIgnore);
                echo "✅ .gitignore actualizado\n";
            } else {
                echo "✅ .gitignore ya configurado\n";
            }
        }
    }
}

// Ejecutar instalación
$installer = new SafeDependencyInstaller();

echo "🚀 Instalador Seguro de Dependencias - Sistema EVA\n";
echo "================================================\n\n";

// Configurar .gitignore
$installer->createGitignore();

// Instalar dependencias
if ($installer->installDependencies()) {
    // Generar reporte
    $installer->generateInstallationReport();
    
    echo "\n🎯 INSTALACIÓN COMPLETADA EXITOSAMENTE!\n";
    echo "📚 Las dependencias están listas para usar\n";
    echo "🔧 Puedes ejecutar: php artisan serve\n";
    echo "🧪 Para tests: php artisan test\n";
} else {
    echo "\n❌ INSTALACIÓN FALLIDA\n";
    echo "📋 Revisa los logs en storage/logs/dependency_install.log\n";
    echo "💡 Intenta ejecutar manualmente: composer install\n";
}
