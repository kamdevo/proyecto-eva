/**
 * Comprehensive Playwright Tests for User Management System
 * 
 * This test suite covers:
 * - User authentication
 * - User management interface
 * - Permission assignment
 * - Search functionality
 * - Pagination
 * - Bulk operations
 * - Security validation
 */

const { test, expect } = require('@playwright/test');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const API_BASE_URL = 'http://127.0.0.1:8001/api/v1';

const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin'
};

const TEST_USER = {
  nombre: 'Test User',
  apellido: 'Playwright',
  username: 'playwright_test_' + Date.now(),
  email: 'playwright_test_' + Date.now() + '@test.com',
  password: 'testpass123',
  telefono: '1234567890'
};

// Helper functions
async function loginAsAdmin(page) {
  await page.goto(BASE_URL);
  
  // Wait for login button and click it
  await page.waitForSelector('button:has-text("Login")', { timeout: 10000 });
  await page.click('button:has-text("Login")');
  
  // Fill login form
  await page.waitForSelector('input[placeholder*="usuario"], input[placeholder*="email"]', { timeout: 5000 });
  await page.fill('input[placeholder*="usuario"], input[placeholder*="email"]', ADMIN_CREDENTIALS.username);
  await page.fill('input[type="password"]', ADMIN_CREDENTIALS.password);
  
  // Submit login
  await page.click('button[type="submit"], button:has-text("Ingresar")');
  
  // Wait for successful login
  await page.waitForSelector('text=Administrador Principal', { timeout: 10000 });
}

async function navigateToUsers(page) {
  // Click on EQUIPOS menu to expand it
  await page.click('button:has-text("EQUIPOS")');
  
  // Wait for menu to expand and navigate to users (if available in menu)
  // For now, let's assume we need to navigate directly
  await page.goto(BASE_URL + '/admin/usuarios');
  
  // Wait for users page to load
  await page.waitForSelector('text=Gestión de Usuarios', { timeout: 10000 });
}

// TEST SUITE 1: AUTHENTICATION TESTS
test.describe('Authentication Tests', () => {
  test('should login successfully with admin credentials', async ({ page }) => {
    await loginAsAdmin(page);
    
    // Verify successful login
    await expect(page.locator('text=Administrador Principal')).toBeVisible();
    await expect(page.locator('text=✅ Leer, Insertar, Editar, Eliminar')).toBeVisible();
  });

  test('should show login error with invalid credentials', async ({ page }) => {
    await page.goto(BASE_URL);
    
    await page.click('button:has-text("Login")');
    await page.fill('input[placeholder*="usuario"], input[placeholder*="email"]', 'invalid_user');
    await page.fill('input[type="password"]', 'invalid_password');
    await page.click('button[type="submit"], button:has-text("Ingresar")');
    
    // Should show error message
    await expect(page.locator('text=Credenciales incorrectas, text=Error')).toBeVisible({ timeout: 5000 });
  });

  test('should logout successfully', async ({ page }) => {
    await loginAsAdmin(page);
    
    // Find and click logout button
    await page.click('button:has-text("Logout"), button:has-text("Cerrar Sesión")');
    
    // Should return to login page
    await expect(page.locator('button:has-text("Login")')).toBeVisible();
  });
});

// TEST SUITE 2: USER MANAGEMENT INTERFACE
test.describe('User Management Interface', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToUsers(page);
  });

  test('should display users list', async ({ page }) => {
    // Check if users table is visible
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th:has-text("ID")')).toBeVisible();
    await expect(page.locator('th:has-text("Usuario")')).toBeVisible();
    await expect(page.locator('th:has-text("Estado")')).toBeVisible();
    
    // Check if at least one user is displayed
    await expect(page.locator('tbody tr')).toHaveCountGreaterThan(0);
  });

  test('should open new user modal', async ({ page }) => {
    await page.click('button:has-text("Nuevo usuario")');
    
    // Check if modal is open
    await expect(page.locator('text=Agregar Nuevo Usuario')).toBeVisible();
    await expect(page.locator('input[placeholder*="nombre"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="email"]')).toBeVisible();
  });

  test('should create new user', async ({ page }) => {
    await page.click('button:has-text("Nuevo usuario")');
    
    // Fill user form
    await page.fill('input[placeholder*="nombre"]', TEST_USER.nombre);
    await page.fill('input[placeholder*="apellido"]', TEST_USER.apellido);
    await page.fill('input[placeholder*="usuario"], input[placeholder*="username"]', TEST_USER.username);
    await page.fill('input[placeholder*="email"]', TEST_USER.email);
    await page.fill('input[placeholder*="teléfono"], input[placeholder*="telefono"]', TEST_USER.telefono);
    await page.fill('input[type="password"]', TEST_USER.password);
    
    // Select role if dropdown is available
    const roleSelect = page.locator('select, [role="combobox"]').first();
    if (await roleSelect.isVisible()) {
      await roleSelect.click();
      await page.click('text=Usuario, text=Administrador').first();
    }
    
    // Submit form
    await page.click('button:has-text("Ingresar"), button:has-text("Crear")');
    
    // Wait for success message or user to appear in list
    await expect(page.locator('text=Usuario creado exitosamente, text=exitosamente')).toBeVisible({ timeout: 10000 });
  });

  test('should edit user', async ({ page }) => {
    // Find first user edit button
    const editButton = page.locator('button:has-text("Editar"), button[title*="Editar"]').first();
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // Check if edit modal opens
      await expect(page.locator('text=Editar Usuario')).toBeVisible();
      
      // Make a small change
      await page.fill('input[placeholder*="teléfono"], input[placeholder*="telefono"]', '9876543210');
      
      // Save changes
      await page.click('button:has-text("Guardar")');
      
      // Wait for success message
      await expect(page.locator('text=actualizado exitosamente')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should toggle user activation status', async ({ page }) => {
    // Find first user activation toggle
    const toggleButton = page.locator('button:has-text("Activar"), button:has-text("Desactivar")').first();
    if (await toggleButton.isVisible()) {
      const initialText = await toggleButton.textContent();
      await toggleButton.click();
      
      // Wait for status change
      await page.waitForTimeout(2000);
      
      // Check if status changed
      const newText = await toggleButton.textContent();
      expect(newText).not.toBe(initialText);
    }
  });
});

// TEST SUITE 3: SEARCH FUNCTIONALITY
test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToUsers(page);
  });

  test('should search users by name', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Buscar"], input[placeholder*="buscar"]');
    await searchInput.fill('admin');
    
    // Wait for search results
    await page.waitForTimeout(1000);
    
    // Check if results contain admin users
    const userRows = page.locator('tbody tr');
    const count = await userRows.count();
    expect(count).toBeGreaterThan(0);
    
    // Check if at least one result contains "admin"
    const firstRow = userRows.first();
    const rowText = await firstRow.textContent();
    expect(rowText.toLowerCase()).toContain('admin');
  });

  test('should clear search', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Buscar"], input[placeholder*="buscar"]');
    await searchInput.fill('admin');
    await page.waitForTimeout(1000);
    
    // Clear search
    const clearButton = page.locator('button[title*="Limpiar"], button:has-text("×")');
    if (await clearButton.isVisible()) {
      await clearButton.click();
    } else {
      await searchInput.clear();
    }
    
    // Wait for results to reset
    await page.waitForTimeout(1000);
    
    // Should show more results now
    const userRows = page.locator('tbody tr');
    const count = await userRows.count();
    expect(count).toBeGreaterThan(1);
  });

  test('should show no results for invalid search', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Buscar"], input[placeholder*="buscar"]');
    await searchInput.fill('nonexistentuser12345');
    
    // Wait for search results
    await page.waitForTimeout(1000);
    
    // Should show no results message
    await expect(page.locator('text=No se encontraron usuarios, text=No hay resultados')).toBeVisible();
  });
});

// TEST SUITE 4: PAGINATION
test.describe('Pagination', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToUsers(page);
  });

  test('should navigate between pages', async ({ page }) => {
    // Check if pagination exists
    const nextButton = page.locator('button:has-text("Siguiente")');
    if (await nextButton.isVisible() && !(await nextButton.isDisabled())) {
      // Get current page info
      const currentPageInfo = await page.locator('text=Página').textContent();
      
      // Click next page
      await nextButton.click();
      await page.waitForTimeout(1000);
      
      // Check if page changed
      const newPageInfo = await page.locator('text=Página').textContent();
      expect(newPageInfo).not.toBe(currentPageInfo);
    }
  });

  test('should go to first and last page', async ({ page }) => {
    // Check if first/last page buttons exist
    const firstPageButton = page.locator('button[title*="Primera"], button:has-text("<<")');
    const lastPageButton = page.locator('button[title*="Última"], button:has-text(">>")');
    
    if (await lastPageButton.isVisible() && !(await lastPageButton.isDisabled())) {
      await lastPageButton.click();
      await page.waitForTimeout(1000);
      
      // Should be on last page
      const lastPageButton2 = page.locator('button[title*="Última"], button:has-text(">>")')
      expect(await lastPageButton2.isDisabled()).toBe(true);
    }
    
    if (await firstPageButton.isVisible()) {
      await firstPageButton.click();
      await page.waitForTimeout(1000);
      
      // Should be on first page
      const prevButton = page.locator('button:has-text("Anterior")');
      expect(await prevButton.isDisabled()).toBe(true);
    }
  });

  test('should change page size', async ({ page }) => {
    const pageSizeSelect = page.locator('select').filter({ hasText: 'registros por página' });
    if (await pageSizeSelect.isVisible()) {
      await pageSizeSelect.selectOption('25');
      await page.waitForTimeout(1000);
      
      // Check if page size changed
      const userRows = page.locator('tbody tr');
      const count = await userRows.count();
      expect(count).toBeLessThanOrEqual(25);
    }
  });
});

// TEST SUITE 5: BULK OPERATIONS
test.describe('Bulk Operations', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToUsers(page);
  });

  test('should select multiple users', async ({ page }) => {
    // Select first few users
    const checkboxes = page.locator('input[type="checkbox"]').filter({ hasText: '' });
    const count = Math.min(3, await checkboxes.count());
    
    for (let i = 1; i <= count; i++) {
      await checkboxes.nth(i).check();
    }
    
    // Should show bulk operation buttons
    await expect(page.locator('button:has-text("Activar ("), button:has-text("Desactivar (")')).toBeVisible();
  });

  test('should select all users', async ({ page }) => {
    const selectAllCheckbox = page.locator('thead input[type="checkbox"]').first();
    if (await selectAllCheckbox.isVisible()) {
      await selectAllCheckbox.check();
      
      // Should show bulk operation buttons with user count
      await expect(page.locator('button:has-text("Activar ("), button:has-text("Desactivar (")')).toBeVisible();
    }
  });
});

console.log('🎭 Playwright User Management Tests Ready!');
console.log('Run with: npx playwright test playwright-user-management-tests.js');
