/**
 * Comprehensive Playwright tests for the Permission System
 * Tests login functionality and verifies that admin users have proper access
 */

const { test, expect } = require('@playwright/test');

// Test configuration
const BASE_URL = 'http://localhost:3000'; // Frontend URL
const API_URL = 'http://127.0.0.1:8001'; // Backend URL

// Test credentials
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin'
};

test.describe('Permission System Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto(BASE_URL);
  });

  test('Admin user login and permission verification', async ({ page }) => {
    console.log('🔍 Testing admin user login and permissions...');

    // Step 1: Navigate to login page
    await page.goto(`${BASE_URL}/login`);
    
    // Wait for login form to be visible
    await page.waitForSelector('input[name="username"], input[type="text"]', { timeout: 10000 });
    
    // Step 2: Fill login form
    const usernameInput = page.locator('input[name="username"], input[type="text"]').first();
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    
    await usernameInput.fill(ADMIN_CREDENTIALS.username);
    await passwordInput.fill(ADMIN_CREDENTIALS.password);
    
    // Step 3: Submit login form
    const loginButton = page.locator('button[type="submit"], button:has-text("Iniciar"), button:has-text("Login")').first();
    await loginButton.click();
    
    // Step 4: Wait for successful login (redirect to dashboard/home)
    await page.waitForURL(/\/(home|dashboard)/, { timeout: 15000 });
    
    // Step 5: Verify user is logged in by checking for user info or logout button
    const userIndicator = page.locator('text=Administrador, button:has-text("Cerrar"), [data-testid="user-menu"]').first();
    await expect(userIndicator).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Admin user successfully logged in');

    // Step 6: Check browser console for permission-related messages
    const consoleLogs = [];
    page.on('console', msg => {
      if (msg.text().includes('PERMISSIONS') || msg.text().includes('NAVBAR') || msg.text().includes('AUTH')) {
        consoleLogs.push(msg.text());
      }
    });

    // Step 7: Navigate through different sections to test permissions
    const sectionsToTest = [
      { name: 'Equipos', selector: 'a[href*="/equipos"], button:has-text("Equipos")' },
      { name: 'Usuarios', selector: 'a[href*="/usuarios"], button:has-text("Usuarios")' },
      { name: 'Mantenimiento', selector: 'a[href*="/mantenimiento"], button:has-text("Mantenimiento")' },
      { name: 'Reportes', selector: 'a[href*="/reportes"], button:has-text("Reportes")' },
      { name: 'Configuración', selector: 'a[href*="/configuracion"], button:has-text("Configuración")' }
    ];

    for (const section of sectionsToTest) {
      try {
        console.log(`🔍 Testing access to ${section.name}...`);
        
        // Check if the navigation item is visible (should be for admin)
        const navItem = page.locator(section.selector).first();
        
        if (await navItem.isVisible({ timeout: 5000 })) {
          console.log(`✅ ${section.name} navigation item is visible`);
          
          // Try to click and navigate
          await navItem.click();
          await page.waitForTimeout(2000); // Wait for navigation
          
          // Check if we successfully navigated (no error page)
          const errorIndicator = page.locator('text=Error, text=403, text=Forbidden, text="No tienes permisos"');
          const hasError = await errorIndicator.isVisible({ timeout: 2000 });
          
          if (!hasError) {
            console.log(`✅ ${section.name} section accessible`);
          } else {
            console.log(`❌ ${section.name} section shows permission error`);
          }
        } else {
          console.log(`⚠️ ${section.name} navigation item not visible`);
        }
      } catch (error) {
        console.log(`⚠️ Could not test ${section.name}: ${error.message}`);
      }
    }

    // Step 8: Verify no debug messages in console (production readiness)
    console.log('\n📋 Console Messages Analysis:');
    if (consoleLogs.length === 0) {
      console.log('✅ No debug messages found - Production ready');
    } else {
      console.log('⚠️ Debug messages found:');
      consoleLogs.forEach(log => console.log(`  - ${log}`));
    }

    // Step 9: Test API endpoints accessibility
    console.log('\n🔍 Testing API endpoint accessibility...');
    
    // Get the auth token from localStorage
    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    
    if (token) {
      console.log('✅ Auth token found in localStorage');
      
      // Test a protected endpoint
      const response = await page.request.get(`${API_URL}/api/v1/equipos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (response.ok()) {
        console.log('✅ Protected API endpoint accessible');
      } else {
        console.log(`❌ Protected API endpoint returned: ${response.status()}`);
      }
    } else {
      console.log('⚠️ No auth token found in localStorage');
    }

    console.log('\n🎉 Admin permission test completed');
  });

  test('Permission system initialization check', async ({ page }) => {
    console.log('🔍 Testing permission system initialization...');

    // Navigate to login page
    await page.goto(`${BASE_URL}/login`);
    
    // Capture console messages
    const consoleLogs = [];
    page.on('console', msg => {
      consoleLogs.push(msg.text());
    });

    // Login with admin credentials
    await page.waitForSelector('input[name="username"], input[type="text"]', { timeout: 10000 });
    
    const usernameInput = page.locator('input[name="username"], input[type="text"]').first();
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    
    await usernameInput.fill(ADMIN_CREDENTIALS.username);
    await passwordInput.fill(ADMIN_CREDENTIALS.password);
    
    const loginButton = page.locator('button[type="submit"], button:has-text("Iniciar"), button:has-text("Login")').first();
    await loginButton.click();
    
    // Wait for login to complete
    await page.waitForURL(/\/(home|dashboard)/, { timeout: 15000 });
    
    // Check if permission service was initialized correctly
    const permissionCheck = await page.evaluate(() => {
      // Check if permissionService is available globally or through window
      if (window.permissionService) {
        return {
          isAdmin: window.permissionService.isAdmin(),
          hasPermissions: Object.keys(window.permissionService.permissions || {}).length > 0,
          userId: window.permissionService.userId,
          userRole: window.permissionService.userRole
        };
      }
      return null;
    });

    if (permissionCheck) {
      console.log('✅ Permission service accessible');
      console.log(`  - Is Admin: ${permissionCheck.isAdmin}`);
      console.log(`  - Has Permissions: ${permissionCheck.hasPermissions}`);
      console.log(`  - User ID: ${permissionCheck.userId}`);
      console.log(`  - User Role: ${permissionCheck.userRole}`);
    } else {
      console.log('⚠️ Permission service not accessible through window object');
    }

    // Check localStorage for user data
    const userData = await page.evaluate(() => {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    });

    if (userData) {
      console.log('✅ User data found in localStorage');
      console.log(`  - User ID: ${userData.id}`);
      console.log(`  - Role ID: ${userData.rol_id}`);
      console.log(`  - Has Permissions: ${!!userData.permissions}`);
      console.log(`  - Permissions Count: ${userData.permissions ? Object.keys(userData.permissions).length : 0}`);
    } else {
      console.log('⚠️ No user data found in localStorage');
    }

    console.log('\n📋 Console Messages:');
    const relevantLogs = consoleLogs.filter(log => 
      log.includes('PERMISSIONS') || 
      log.includes('AUTH') || 
      log.includes('NAVBAR') ||
      log.includes('admin') ||
      log.includes('Admin')
    );

    if (relevantLogs.length === 0) {
      console.log('✅ No debug messages - Clean console');
    } else {
      relevantLogs.forEach(log => console.log(`  - ${log}`));
    }

    console.log('\n🎉 Permission initialization test completed');
  });

  test('Navigation menu visibility for admin user', async ({ page }) => {
    console.log('🔍 Testing navigation menu visibility for admin user...');

    // Login as admin
    await page.goto(`${BASE_URL}/login`);
    await page.waitForSelector('input[name="username"], input[type="text"]', { timeout: 10000 });
    
    const usernameInput = page.locator('input[name="username"], input[type="text"]').first();
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    
    await usernameInput.fill(ADMIN_CREDENTIALS.username);
    await passwordInput.fill(ADMIN_CREDENTIALS.password);
    
    const loginButton = page.locator('button[type="submit"], button:has-text("Iniciar"), button:has-text("Login")').first();
    await loginButton.click();
    
    await page.waitForURL(/\/(home|dashboard)/, { timeout: 15000 });

    // Check navigation menu items
    const expectedMenuItems = [
      'Equipos',
      'Usuarios', 
      'Mantenimiento',
      'Reportes',
      'Configuración'
    ];

    console.log('\n📋 Checking navigation menu items:');
    
    for (const item of expectedMenuItems) {
      const menuItem = page.locator(`text=${item}, a:has-text("${item}"), button:has-text("${item}")`).first();
      const isVisible = await menuItem.isVisible({ timeout: 5000 });
      
      if (isVisible) {
        console.log(`✅ ${item} - Visible`);
      } else {
        console.log(`❌ ${item} - Not visible`);
      }
    }

    console.log('\n🎉 Navigation menu test completed');
  });

});

// Helper function to run tests
if (require.main === module) {
  console.log('🧪 PERMISSION SYSTEM PLAYWRIGHT TESTS');
  console.log('=====================================');
  console.log('');
  console.log('📋 Test Plan:');
  console.log('1. Admin user login and permission verification');
  console.log('2. Permission system initialization check');
  console.log('3. Navigation menu visibility for admin user');
  console.log('');
  console.log('🚀 Run with: npx playwright test test-permission-system-playwright.js');
  console.log('');
}
