<?php

/**
 * COMPREHENSIVE AUDIT OF ALL FRONTEND API ENDPOINTS
 * Find any mismatched or incorrect endpoints
 */

echo "🔍 COMPREHENSIVE FRONTEND API ENDPOINT AUDIT\n";
echo "=" . str_repeat("=", 70) . "\n\n";

// Function to recursively scan files
function scanDirectory($dir, $extensions = ['js', 'jsx', 'ts', 'tsx']) {
    $files = [];
    if (!is_dir($dir)) return $files;
    
    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS)
    );
    
    foreach ($iterator as $file) {
        if ($file->isFile()) {
            $ext = strtolower($file->getExtension());
            if (in_array($ext, $extensions)) {
                $files[] = $file->getPathname();
            }
        }
    }
    
    return $files;
}

// Function to find API calls in file content
function findApiCalls($content, $filename) {
    $issues = [];
    
    // Patterns to look for
    $patterns = [
        // Hardcoded URLs
        '/http:\/\/127\.0\.0\.1:8001\/api\/v1\/[^"\'`\s]+/' => 'Hardcoded 127.0.0.1:8001 URL',
        '/http:\/\/localhost:8001\/api\/v1\/[^"\'`\s]+/' => 'Hardcoded localhost:8001 URL',
        '/http:\/\/localhost:8000\/api\/v1\/[^"\'`\s]+/' => 'Hardcoded localhost:8000 URL',
        
        // Potential wrong endpoints
        '/\/api\/v1\/admin\/users\/[^"\'`\s]*/' => 'OLD admin/users endpoint (should be usuarios)',
        '/\/api\/v1\/admin\/[^"\'`\s]*/' => 'Admin endpoint (verify if correct)',
        
        // Auth token issues
        '/localStorage\.getItem\(["\']auth_token["\']\)/' => 'OLD auth_token (should be eva_auth_token)',
        '/localStorage\.getItem\(["\']token["\']\)/' => 'Generic token (should be eva_auth_token)',
        
        // Fetch calls without proper base URL
        '/fetch\s*\(\s*["\'][^"\']*\/api\/v1\/[^"\']*["\']\s*[,)]/' => 'Direct API path in fetch (should use base URL)',
    ];
    
    foreach ($patterns as $pattern => $description) {
        if (preg_match_all($pattern, $content, $matches, PREG_OFFSET_CAPTURE)) {
            foreach ($matches[0] as $match) {
                $line = substr_count(substr($content, 0, $match[1]), "\n") + 1;
                $issues[] = [
                    'type' => $description,
                    'match' => $match[0],
                    'line' => $line,
                    'file' => $filename
                ];
            }
        }
    }
    
    return $issues;
}

// Scan frontend directory
$frontendDir = 'eva-frontend/src';
echo "📂 Scanning directory: $frontendDir\n\n";

if (!is_dir($frontendDir)) {
    echo "❌ Frontend directory not found: $frontendDir\n";
    exit(1);
}

$files = scanDirectory($frontendDir);
echo "📋 Found " . count($files) . " files to scan\n\n";

$allIssues = [];
$fileCount = 0;

foreach ($files as $file) {
    $fileCount++;
    $relativePath = str_replace('eva-frontend/src/', '', $file);
    
    if (!file_exists($file)) continue;
    
    $content = file_get_contents($file);
    $issues = findApiCalls($content, $relativePath);
    
    if (!empty($issues)) {
        $allIssues = array_merge($allIssues, $issues);
        echo "🔍 $relativePath: " . count($issues) . " issues found\n";
    }
}

echo "\n" . str_repeat("=", 70) . "\n";
echo "📊 AUDIT RESULTS\n";
echo str_repeat("=", 70) . "\n\n";

if (empty($allIssues)) {
    echo "🎉 NO ISSUES FOUND! All endpoints appear to be correct.\n";
} else {
    echo "⚠️ FOUND " . count($allIssues) . " POTENTIAL ISSUES:\n\n";
    
    // Group issues by type
    $groupedIssues = [];
    foreach ($allIssues as $issue) {
        $groupedIssues[$issue['type']][] = $issue;
    }
    
    foreach ($groupedIssues as $type => $issues) {
        echo "🚨 $type (" . count($issues) . " occurrences):\n";
        echo str_repeat("-", 50) . "\n";
        
        foreach ($issues as $issue) {
            echo "   📁 {$issue['file']}:{$issue['line']}\n";
            echo "   🔍 {$issue['match']}\n\n";
        }
    }
}

// Additional specific checks
echo "\n" . str_repeat("=", 70) . "\n";
echo "🔍 SPECIFIC ENDPOINT CHECKS\n";
echo str_repeat("=", 70) . "\n\n";

// Check if Usuarios.jsx has been fixed
$usuariosFile = 'eva-frontend/src/components/Usuarios.jsx';
if (file_exists($usuariosFile)) {
    $content = file_get_contents($usuariosFile);
    
    echo "📋 Checking Usuarios.jsx for activation endpoints:\n";
    
    // Check for correct endpoints
    $correctPatterns = [
        '/usuarios\/\$\{[^}]+\}\/activate/' => 'Individual activation endpoint',
        '/usuarios\/\$\{[^}]+\}\/deactivate/' => 'Individual deactivation endpoint',
        '/usuarios\/bulk-activate/' => 'Bulk activation endpoint',
        '/usuarios\/bulk-deactivate/' => 'Bulk deactivation endpoint',
        '/eva_auth_token/' => 'Correct auth token'
    ];
    
    foreach ($correctPatterns as $pattern => $description) {
        if (preg_match($pattern, $content)) {
            echo "   ✅ $description: FOUND\n";
        } else {
            echo "   ❌ $description: NOT FOUND\n";
        }
    }
    
    // Check for old incorrect patterns
    $incorrectPatterns = [
        '/admin\/users\/.*toggle-activation/' => 'OLD toggle-activation endpoint',
        '/admin\/users\/bulk-/' => 'OLD admin/users bulk endpoints',
        '/auth_token[^_]/' => 'OLD auth_token (without eva_ prefix)'
    ];
    
    echo "\n   Checking for old incorrect patterns:\n";
    foreach ($incorrectPatterns as $pattern => $description) {
        if (preg_match($pattern, $content)) {
            echo "   ❌ $description: STILL PRESENT (NEEDS FIX)\n";
        } else {
            echo "   ✅ $description: NOT FOUND (GOOD)\n";
        }
    }
}

echo "\n" . str_repeat("=", 70) . "\n";
echo "🎯 RECOMMENDATIONS\n";
echo str_repeat("=", 70) . "\n\n";

if (empty($allIssues)) {
    echo "✅ All endpoints appear to be correctly configured!\n";
    echo "✅ No hardcoded URLs found\n";
    echo "✅ No old endpoint patterns detected\n";
    echo "✅ Authentication tokens appear correct\n\n";
    echo "🚀 The frontend should work without 405 Method Not Allowed errors!\n";
} else {
    echo "🔧 FIXES NEEDED:\n\n";
    
    $recommendations = [
        'Hardcoded 127.0.0.1:8001 URL' => 'Replace with API_CONFIG.API_URL or relative paths',
        'Hardcoded localhost:8001 URL' => 'Replace with API_CONFIG.API_URL or relative paths',
        'OLD admin/users endpoint' => 'Replace with /api/v1/usuarios/ endpoints',
        'OLD auth_token' => 'Replace with eva_auth_token',
        'Direct API path in fetch' => 'Use proper base URL configuration'
    ];
    
    foreach ($groupedIssues as $type => $issues) {
        if (isset($recommendations[$type])) {
            echo "   🔧 $type:\n";
            echo "      → {$recommendations[$type]}\n\n";
        }
    }
}

echo "✅ Audit complete!\n";
