import { test, expect } from '@playwright/test';

test.describe('Shopping Cart', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test to start with empty cart
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should display cart icon in navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check that cart icon is visible
    const cartIcon = page.getByRole('link', { name: 'Shopping cart' });
    await expect(cartIcon).toBeVisible();
  });

  test('should show empty cart badge initially', async ({ page }) => {
    await page.goto('/');
    
    // Cart badge should not be visible when cart is empty
    const cartBadge = page.locator('a[href="/cart"] span');
    await expect(cartBadge).not.toBeVisible();
  });

  test('should add product to cart from products page', async ({ page }) => {
    await page.goto('/products');
    
    // Wait for products to load
    await page.waitForSelector('h3:has-text("SmartFeeder One")');
    
    // Find the first product and increase quantity
    const firstProduct = page.locator('.grid > div').first();
    const increaseBtn = firstProduct.getByRole('button', { name: /Increase quantity/ });
    await increaseBtn.click();
    
    // Click "Add to Cart" button
    const addToCartBtn = firstProduct.getByRole('button', { name: /Add.*to cart/ });
    await addToCartBtn.click();
    
    // Verify toast notification appears
    await expect(page.locator('text=/Added.*to cart/')).toBeVisible();
    
    // Verify cart badge shows "1"
    const cartBadge = page.locator('a[href="/cart"] span');
    await expect(cartBadge).toHaveText('1');
  });

  test('should add multiple items to cart', async ({ page }) => {
    await page.goto('/products');
    
    // Wait for products to load
    await page.waitForSelector('h3:has-text("SmartFeeder One")');
    
    // Add first product
    const firstProduct = page.locator('.grid > div').first();
    await firstProduct.getByRole('button', { name: /Increase quantity/ }).click();
    await firstProduct.getByRole('button', { name: /Add.*to cart/ }).click();
    await page.waitForTimeout(500); // Wait for toast to appear
    
    // Add second product
    const secondProduct = page.locator('.grid > div').nth(1);
    await secondProduct.getByRole('button', { name: /Increase quantity/ }).click();
    await secondProduct.getByRole('button', { name: /Add.*to cart/ }).click();
    
    // Verify cart badge shows "2"
    const cartBadge = page.locator('a[href="/cart"] span');
    await expect(cartBadge).toHaveText('2');
  });

  test('should display cart page with added items', async ({ page }) => {
    // Add item to cart first
    await page.goto('/products');
    await page.waitForSelector('h3:has-text("SmartFeeder One")');
    
    const firstProduct = page.locator('.grid > div').first();
    await firstProduct.getByRole('button', { name: /Increase quantity/ }).click();
    await firstProduct.getByRole('button', { name: /Add.*to cart/ }).click();
    
    // Navigate to cart
    await page.getByRole('link', { name: 'Shopping cart' }).click();
    await expect(page).toHaveURL('/cart');
    
    // Verify cart page displays the item
    await expect(page.getByRole('heading', { name: 'Shopping Cart' })).toBeVisible();
    await expect(page.locator('text=SmartFeeder One')).toBeVisible();
    
    // Verify order summary is visible
    await expect(page.getByRole('heading', { name: 'Order Summary' })).toBeVisible();
    await expect(page.locator('text=/Subtotal.*items/')).toBeVisible();
    await expect(page.locator('text=Grand Total')).toBeVisible();
  });

  test('should update item quantity in cart', async ({ page }) => {
    // Add item to cart
    await page.goto('/products');
    await page.waitForSelector('h3:has-text("SmartFeeder One")');
    
    const firstProduct = page.locator('.grid > div').first();
    await firstProduct.getByRole('button', { name: /Increase quantity/ }).click();
    await firstProduct.getByRole('button', { name: /Add.*to cart/ }).click();
    
    // Navigate to cart
    await page.goto('/cart');
    
    // Get initial total
    const initialTotal = await page.locator('td:has-text("$") >> nth=1').textContent();
    
    // Increase quantity in cart
    await page.getByRole('button', { name: /Increase quantity/ }).first().click();
    
    // Verify quantity changed
    await expect(page.locator('table').first()).toContainText('2');
    
    // Verify total increased
    const newTotal = await page.locator('td:has-text("$") >> nth=1').textContent();
    expect(newTotal).not.toBe(initialTotal);
  });

  test('should remove item from cart', async ({ page }) => {
    // Add item to cart
    await page.goto('/products');
    await page.waitForSelector('h3:has-text("SmartFeeder One")');
    
    const firstProduct = page.locator('.grid > div').first();
    await firstProduct.getByRole('button', { name: /Increase quantity/ }).click();
    await firstProduct.getByRole('button', { name: /Add.*to cart/ }).click();
    
    // Navigate to cart
    await page.goto('/cart');
    
    // Remove item
    await page.getByRole('button', { name: /Remove.*from cart/ }).first().click();
    
    // Verify toast notification
    await expect(page.locator('text=/Removed.*from cart/')).toBeVisible();
    
    // Verify empty cart message
    await expect(page.locator('text=Your cart is empty')).toBeVisible();
  });

  test('should apply coupon code', async ({ page }) => {
    // Add item to cart
    await page.goto('/products');
    await page.waitForSelector('h3:has-text("SmartFeeder One")');
    
    const firstProduct = page.locator('.grid > div').first();
    await firstProduct.getByRole('button', { name: /Increase quantity/ }).click();
    await firstProduct.getByRole('button', { name: /Add.*to cart/ }).click();
    
    // Navigate to cart
    await page.goto('/cart');
    
    // Get initial discount
    const initialDiscount = await page.locator('text=/Discount.*-\\$\\d+\\.\\d+/').textContent();
    
    // Apply coupon
    await page.getByPlaceholder('Enter code').fill('SAVE10');
    await page.getByRole('button', { name: 'Apply' }).click();
    
    // Verify success message
    await expect(page.locator('text=Coupon applied successfully!')).toBeVisible();
    
    // Verify discount increased
    const newDiscount = await page.locator('text=/Discount.*-\\$\\d+\\.\\d+/').textContent();
    expect(newDiscount).not.toBe(initialDiscount);
  });

  test('should show error for invalid coupon', async ({ page }) => {
    // Add item to cart
    await page.goto('/products');
    await page.waitForSelector('h3:has-text("SmartFeeder One")');
    
    const firstProduct = page.locator('.grid > div').first();
    await firstProduct.getByRole('button', { name: /Increase quantity/ }).click();
    await firstProduct.getByRole('button', { name: /Add.*to cart/ }).click();
    
    // Navigate to cart
    await page.goto('/cart');
    
    // Try to apply invalid coupon
    await page.getByPlaceholder('Enter code').fill('INVALID');
    await page.getByRole('button', { name: 'Apply' }).click();
    
    // Verify error message
    await expect(page.locator('text=Invalid coupon code')).toBeVisible();
  });

  test('should clear entire cart', async ({ page }) => {
    // Add items to cart
    await page.goto('/products');
    await page.waitForSelector('h3:has-text("SmartFeeder One")');
    
    const firstProduct = page.locator('.grid > div').first();
    await firstProduct.getByRole('button', { name: /Increase quantity/ }).click();
    await firstProduct.getByRole('button', { name: /Add.*to cart/ }).click();
    
    // Navigate to cart
    await page.goto('/cart');
    
    // Click clear cart
    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Clear Cart' }).click();
    
    // Verify empty cart message
    await expect(page.locator('text=Your cart is empty')).toBeVisible();
  });

  test('should persist cart data in localStorage', async ({ page }) => {
    // Add item to cart
    await page.goto('/products');
    await page.waitForSelector('h3:has-text("SmartFeeder One")');
    
    const firstProduct = page.locator('.grid > div').first();
    await firstProduct.getByRole('button', { name: /Increase quantity/ }).click();
    await firstProduct.getByRole('button', { name: /Add.*to cart/ }).click();
    
    // Reload page
    await page.reload();
    
    // Verify cart badge still shows "1"
    const cartBadge = page.locator('a[href="/cart"] span');
    await expect(cartBadge).toHaveText('1');
    
    // Navigate to cart and verify item is still there
    await page.goto('/cart');
    await expect(page.locator('text=SmartFeeder One')).toBeVisible();
  });

  test('should navigate to products from empty cart', async ({ page }) => {
    await page.goto('/cart');
    
    // Verify empty cart state
    await expect(page.locator('text=Your cart is empty')).toBeVisible();
    
    // Click "Browse Products" button
    await page.getByRole('link', { name: 'Browse Products' }).click();
    
    // Verify navigation to products page
    await expect(page).toHaveURL('/products');
  });

  test('should calculate totals correctly', async ({ page }) => {
    // Add item to cart
    await page.goto('/products');
    await page.waitForSelector('h3:has-text("SmartFeeder One")');
    
    const firstProduct = page.locator('.grid > div').first();
    
    // Get unit price from product page
    const priceText = await firstProduct.locator('text=/\\$\\d+\\.\\d+/').last().textContent();
    const unitPrice = parseFloat(priceText?.replace('$', '') || '0');
    
    // Add to cart
    await firstProduct.getByRole('button', { name: /Increase quantity/ }).click();
    await firstProduct.getByRole('button', { name: /Add.*to cart/ }).click();
    
    // Navigate to cart
    await page.goto('/cart');
    
    // Verify subtotal equals unit price
    const subtotalText = await page.locator('text=/Subtotal.*\\$\\d+\\.\\d+/').textContent();
    const subtotal = parseFloat(subtotalText?.match(/\$(\d+\.\d+)/)?.[1] || '0');
    
    expect(Math.abs(subtotal - unitPrice)).toBeLessThan(0.01);
    
    // Verify grand total = subtotal - discount + shipping
    const discountText = await page.locator('text=/Discount.*-\\$\\d+\\.\\d+/').textContent();
    const discount = parseFloat(discountText?.match(/\$(\d+\.\d+)/)?.[1] || '0');
    
    const shippingText = await page.locator('text=/Shipping.*\\$\\d+\\.\\d+/').textContent();
    const shipping = parseFloat(shippingText?.match(/\$(\d+\.\d+)/)?.[1] || '0');
    
    const grandTotalText = await page.locator('text=/Grand Total.*\\$\\d+\\.\\d+/').textContent();
    const grandTotal = parseFloat(grandTotalText?.match(/\$(\d+\.\d+)/)?.[1] || '0');
    
    const expectedTotal = subtotal - discount + shipping;
    expect(Math.abs(grandTotal - expectedTotal)).toBeLessThan(0.01);
  });

  test('should work in dark mode', async ({ page }) => {
    await page.goto('/');
    
    // Toggle dark mode
    await page.getByRole('button', { name: 'Toggle dark/light mode' }).click();
    
    // Add item to cart
    await page.goto('/products');
    await page.waitForSelector('h3:has-text("SmartFeeder One")');
    
    const firstProduct = page.locator('.grid > div').first();
    await firstProduct.getByRole('button', { name: /Increase quantity/ }).click();
    await firstProduct.getByRole('button', { name: /Add.*to cart/ }).click();
    
    // Navigate to cart
    await page.goto('/cart');
    
    // Verify dark mode classes are applied (check background color)
    const body = page.locator('body');
    const bgClass = await body.getAttribute('class');
    expect(bgClass).toContain('dark');
    
    // Verify cart page still works
    await expect(page.getByRole('heading', { name: 'Shopping Cart' })).toBeVisible();
  });

  test('should prevent adding item with zero quantity', async ({ page }) => {
    await page.goto('/products');
    await page.waitForSelector('h3:has-text("SmartFeeder One")');
    
    const firstProduct = page.locator('.grid > div').first();
    
    // Try to add to cart without increasing quantity
    const addToCartBtn = firstProduct.getByRole('button', { name: /Add.*to cart/ });
    
    // Button should be disabled
    await expect(addToCartBtn).toBeDisabled();
  });

  test('should handle multiple quantity increases', async ({ page }) => {
    await page.goto('/products');
    await page.waitForSelector('h3:has-text("SmartFeeder One")');
    
    const firstProduct = page.locator('.grid > div').first();
    const increaseBtn = firstProduct.getByRole('button', { name: /Increase quantity/ });
    
    // Increase quantity 3 times
    await increaseBtn.click();
    await increaseBtn.click();
    await increaseBtn.click();
    
    // Verify quantity shows 3
    const quantityDisplay = firstProduct.locator('[aria-label*="Quantity"]');
    await expect(quantityDisplay).toHaveText('3');
    
    // Add to cart
    await firstProduct.getByRole('button', { name: /Add.*to cart/ }).click();
    
    // Navigate to cart and verify quantity
    await page.goto('/cart');
    await expect(page.locator('table').first()).toContainText('3');
  });

  test('should decrease quantity to zero and remove item', async ({ page }) => {
    // Add item to cart
    await page.goto('/products');
    await page.waitForSelector('h3:has-text("SmartFeeder One")');
    
    const firstProduct = page.locator('.grid > div').first();
    await firstProduct.getByRole('button', { name: /Increase quantity/ }).click();
    await firstProduct.getByRole('button', { name: /Add.*to cart/ }).click();
    
    // Navigate to cart
    await page.goto('/cart');
    
    // Decrease quantity to 0
    await page.getByRole('button', { name: /Decrease quantity/ }).first().click();
    
    // Item should be removed from cart
    await expect(page.locator('text=Your cart is empty')).toBeVisible();
  });

  test('should show Continue Shopping button', async ({ page }) => {
    // Add item and go to cart
    await page.goto('/products');
    await page.waitForSelector('h3:has-text("SmartFeeder One")');
    
    const firstProduct = page.locator('.grid > div').first();
    await firstProduct.getByRole('button', { name: /Increase quantity/ }).click();
    await firstProduct.getByRole('button', { name: /Add.*to cart/ }).click();
    
    await page.goto('/cart');
    
    // Click Continue Shopping
    await page.getByRole('link', { name: 'Continue Shopping' }).click();
    
    // Should navigate to products
    await expect(page).toHaveURL('/products');
  });

  test('should show Proceed to Checkout button', async ({ page }) => {
    // Add item and go to cart
    await page.goto('/products');
    await page.waitForSelector('h3:has-text("SmartFeeder One")');
    
    const firstProduct = page.locator('.grid > div').first();
    await firstProduct.getByRole('button', { name: /Increase quantity/ }).click();
    await firstProduct.getByRole('button', { name: /Add.*to cart/ }).click();
    
    await page.goto('/cart');
    
    // Verify Proceed to Checkout button is visible
    await expect(page.getByRole('button', { name: 'Proceed to Checkout' })).toBeVisible();
  });
});
