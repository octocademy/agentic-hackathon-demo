# Shopping Cart E2E Tests

This directory contains end-to-end tests for the shopping cart functionality using Playwright.

## Test Coverage

The test suite covers the following scenarios:

### Basic Functionality
- ✅ Cart icon visibility in navigation
- ✅ Empty cart badge initially
- ✅ Adding products to cart from products page
- ✅ Adding multiple items to cart
- ✅ Cart badge updates

### Cart Page
- ✅ Displaying cart page with added items
- ✅ Order summary visibility
- ✅ Product information display (image, name, price, quantity)

### Cart Operations
- ✅ Updating item quantity (increase/decrease)
- ✅ Removing items from cart
- ✅ Clearing entire cart
- ✅ Preventing zero quantity additions

### Coupon System
- ✅ Applying valid coupon codes (SAVE10, WELCOME15, MEOW20)
- ✅ Error handling for invalid coupons
- ✅ Discount calculation updates

### Calculations
- ✅ Subtotal calculation
- ✅ Discount application
- ✅ Shipping costs
- ✅ Grand total calculation

### Persistence
- ✅ LocalStorage persistence across page reloads
- ✅ Cart state maintained after navigation

### UI/UX
- ✅ Empty cart state with call-to-action
- ✅ Toast notifications for cart actions
- ✅ Dark mode compatibility
- ✅ Navigation between pages
- ✅ Proceed to Checkout button
- ✅ Continue Shopping functionality

## Running the Tests

### Prerequisites
1. Install dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

### Run Tests

```bash
# Run all tests in headless mode
npm run test:e2e

# Run tests in UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug tests
npm run test:e2e:debug
```

### Run Specific Tests

```bash
# Run a specific test file
npx playwright test shopping-cart.spec.ts

# Run a specific test
npx playwright test -g "should add product to cart"
```

### View Test Results

After running tests, you can view the HTML report:

```bash
npx playwright show-report
```

## Test Structure

Each test follows this pattern:
1. **Setup**: Clear localStorage and navigate to the starting page
2. **Action**: Perform user interactions (click, type, etc.)
3. **Assertion**: Verify expected outcomes

## CI/CD Integration

The tests are configured to run in CI environments with:
- Automatic retries on failure (2 retries in CI)
- Single worker for stability
- Screenshot capture on failure
- Trace collection for debugging

## Writing New Tests

To add new test cases:

1. Add them to `shopping-cart.spec.ts`
2. Follow the existing test structure
3. Use descriptive test names
4. Include proper assertions
5. Clean up state in `beforeEach`

Example:
```typescript
test('should do something', async ({ page }) => {
  // Setup
  await page.goto('/cart');
  
  // Action
  await page.click('button[aria-label="Some action"]');
  
  // Assertion
  await expect(page.locator('text=Expected result')).toBeVisible();
});
```

## Troubleshooting

### Tests failing locally
- Ensure dev server is running on port 5137
- Clear browser cache: `npx playwright clean`
- Update browsers: `npx playwright install`

### Flaky tests
- Add appropriate `waitFor` statements
- Use `page.waitForLoadState('networkidle')` when needed
- Increase timeout for slow operations

### Debugging
- Use `--debug` flag to step through tests
- Add `await page.pause()` to pause execution
- Check screenshots in `test-results/` folder
