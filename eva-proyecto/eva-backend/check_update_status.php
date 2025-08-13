<?php

/**
 * Check if the equipment update actually succeeded despite the redirect
 */

require_once __DIR__ . '/vendor/autoload.php';
use Illuminate\Support\Facades\DB;

echo "🔍 CHECKING EQUIPMENT UPDATE STATUS\n";
echo "===================================\n\n";

try {
    $app = require_once __DIR__ . '/bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
    
    echo "📋 Step 1: Checking current equipment data...\n";
    
    $equipment = DB::table('equipos')->where('id', 69)->first();
    
    if (!$equipment) {
        echo "❌ Equipment ID 69 not found\n";
        exit(1);
    }
    
    echo "✅ Equipment ID 69 found\n";
    echo "Current data:\n";
    echo "   name: {$equipment->name}\n";
    echo "   descripcion: {$equipment->descripcion}\n";
    echo "   fecha_cambio: {$equipment->fecha_cambio}\n";
    echo "   manual: {$equipment->manual}\n";
    echo "   plano: {$equipment->plano}\n\n";
    
    // Parse JSON to show checkbox states
    if ($equipment->manual) {
        $manuales = json_decode($equipment->manual, true);
        echo "📋 MANUALES (checkboxes):\n";
        foreach ($manuales as $key => $value) {
            $status = $value ? 'CHECKED ✓' : 'UNCHECKED ○';
            echo "   {$key}: {$status}\n";
        }
        echo "\n";
    }
    
    if ($equipment->plano) {
        $planos = json_decode($equipment->plano, true);
        echo "📋 PLANOS (checkboxes):\n";
        foreach ($planos as $key => $value) {
            $status = $value ? 'CHECKED ✓' : 'UNCHECKED ○';
            echo "   {$key}: {$status}\n";
        }
        echo "\n";
    }
    
    echo "📋 Step 2: Checking recent changes...\n";
    
    // Check if the name contains recent test updates
    $recentUpdates = [
        'API TEST SUCCESS',
        'FINAL TEST',
        'TIMESTAMP FIXED',
        'VALIDATION FIXED'
    ];
    
    $hasRecentUpdate = false;
    foreach ($recentUpdates as $update) {
        if (strpos($equipment->name, $update) !== false) {
            echo "✅ Found recent update marker: {$update}\n";
            $hasRecentUpdate = true;
        }
    }
    
    if (!$hasRecentUpdate) {
        echo "⚠️ No recent update markers found in name\n";
        echo "   This suggests the frontend update may not have reached the database\n";
    }
    
    // Check fecha_cambio to see when it was last updated
    $lastUpdate = new DateTime($equipment->fecha_cambio);
    $now = new DateTime();
    $diff = $now->diff($lastUpdate);
    
    echo "📋 Last update timing:\n";
    echo "   fecha_cambio: {$equipment->fecha_cambio}\n";
    echo "   Time since last update: {$diff->i} minutes, {$diff->s} seconds ago\n";
    
    if ($diff->i < 5) {
        echo "✅ Equipment was updated very recently (within 5 minutes)\n";
        echo "   This suggests the API call may have succeeded despite the redirect\n";
    } else {
        echo "⚠️ Equipment was not updated recently\n";
        echo "   This suggests the API call failed or didn't reach the database\n";
    }
    
    echo "\n📋 Step 3: Checking Laravel logs for errors...\n";
    
    $logPath = __DIR__ . '/storage/logs/laravel.log';
    if (file_exists($logPath)) {
        echo "✅ Laravel log file found\n";
        
        // Get the last 50 lines of the log
        $logLines = array_slice(file($logPath), -50);
        $recentErrors = [];
        
        foreach ($logLines as $line) {
            if (strpos($line, 'ERROR') !== false || strpos($line, 'Exception') !== false) {
                $recentErrors[] = trim($line);
            }
        }
        
        if (!empty($recentErrors)) {
            echo "❌ Recent errors found in Laravel logs:\n";
            foreach (array_slice($recentErrors, -5) as $error) {
                echo "   {$error}\n";
            }
        } else {
            echo "✅ No recent errors found in Laravel logs\n";
        }
    } else {
        echo "⚠️ Laravel log file not found at: {$logPath}\n";
    }
    
    echo "\n📋 Step 4: Testing authentication middleware...\n";
    
    // Check if there are any authentication-related tables
    try {
        $usersCount = DB::table('users')->count();
        echo "✅ Users table exists with {$usersCount} users\n";
        
        $tokensCount = DB::table('personal_access_tokens')->count();
        echo "✅ Personal access tokens table exists with {$tokensCount} tokens\n";
        
        // Check for active sessions
        if (DB::getSchemaBuilder()->hasTable('sessions')) {
            $sessionsCount = DB::table('sessions')->count();
            echo "✅ Sessions table exists with {$sessionsCount} active sessions\n";
        }
        
    } catch (Exception $e) {
        echo "❌ Authentication table error: " . $e->getMessage() . "\n";
    }
    
    echo "\n🎯 DIAGNOSIS:\n";
    echo "=============\n";
    
    if ($hasRecentUpdate && $diff->i < 5) {
        echo "🎉 ✅ GOOD NEWS: The update likely succeeded!\n";
        echo "The redirect to login happened AFTER the database was updated.\n";
        echo "This is an authentication/session issue, not a database issue.\n\n";
        
        echo "🔧 LIKELY CAUSE:\n";
        echo "• Frontend session expired during the request\n";
        echo "• Authentication middleware triggered after successful update\n";
        echo "• Token refresh needed\n\n";
        
        echo "🚀 SOLUTION NEEDED:\n";
        echo "• Fix frontend authentication state management\n";
        echo "• Ensure tokens are properly refreshed\n";
        echo "• Handle authentication errors gracefully\n";
        
    } else {
        echo "❌ The update did NOT reach the database\n";
        echo "The authentication failure prevented the API call from completing.\n\n";
        
        echo "🔧 LIKELY CAUSE:\n";
        echo "• Authentication failed before reaching the controller\n";
        echo "• Invalid or expired token\n";
        echo "• Session timeout\n\n";
        
        echo "🚀 SOLUTION NEEDED:\n";
        echo "• Check frontend token management\n";
        echo "• Verify API authentication middleware\n";
        echo "• Fix session handling\n";
    }
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n📋 Equipment update status check completed.\n";
