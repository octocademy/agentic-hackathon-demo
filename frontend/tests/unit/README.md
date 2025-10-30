# Toast Component Unit Tests

This directory contains unit tests for the Toast notification component using Vitest and React Testing Library.

## Test Coverage

The test suite provides comprehensive coverage of the Toast component with 26 test cases across multiple categories:

### Rendering (8 tests)
- ✅ Message display
- ✅ Default success type styling
- ✅ Error type styling (red background)
- ✅ Info type styling (blue background)
- ✅ Close button presence
- ✅ Success icon rendering (checkmark)
- ✅ Error icon rendering (X)
- ✅ Info icon rendering (info circle)

### Auto-dismiss Behavior (4 tests)
- ✅ Default 3-second auto-dismiss
- ✅ Custom duration auto-dismiss
- ✅ No premature dismiss
- ✅ Timer cleanup on unmount

### User Interactions (2 tests)
- ✅ Manual close via button click
- ✅ Manual close before auto-dismiss

### Styling and Classes (4 tests)
- ✅ Fixed positioning
- ✅ Animation class application
- ✅ Z-index for overlay
- ✅ Message styling

### Edge Cases (5 tests)
- ✅ Empty message handling
- ✅ Very long messages
- ✅ Zero duration
- ✅ Very short duration (100ms)
- ✅ Very long duration (60s)

### Accessibility (2 tests)
- ✅ Accessible close button
- ✅ Screen reader text

### Multiple Toasts (1 test)
- ✅ Simultaneous toasts with different types

## Running the Tests

### Run all unit tests
```bash
npm run test:unit
```

### Run tests in watch mode (during development)
```bash
npm run test:unit:watch
```

### Run tests with UI (interactive)
```bash
npm run test:unit:ui
```

### Run only specific tests
```bash
# Run specific test file
npx vitest run tests/unit/Toast.test.tsx

# Run specific test by name
npx vitest run -t "should render toast with message"
```

## Test Structure

Each test follows the Arrange-Act-Assert pattern:

```typescript
it('should do something', () => {
  // Arrange: Set up test data and mocks
  const onClose = vi.fn();
  
  // Act: Render component and interact
  render(<Toast message="Test" onClose={onClose} />);
  
  // Assert: Verify expected behavior
  expect(screen.getByText('Test')).toBeInTheDocument();
});
```

## Key Testing Utilities

### Vitest
- `vi.fn()` - Create mock functions
- `vi.useFakeTimers()` - Control time in tests
- `vi.advanceTimersByTime()` - Fast-forward time

### React Testing Library
- `render()` - Render components
- `screen` - Query rendered elements
- `userEvent` - Simulate user interactions

### Custom Matchers
- `toBeInTheDocument()` - Element is in DOM
- `toHaveTextContent()` - Text content check
- `toHaveClass()` - CSS class check

## Timer Testing

The Toast component uses `setTimeout` for auto-dismiss. Tests use fake timers to control this:

```typescript
beforeEach(() => {
  vi.useFakeTimers(); // Start with fake timers
});

afterEach(() => {
  vi.restoreAllMocks(); // Clean up after each test
});

it('should auto-dismiss', () => {
  render(<Toast message="Test" onClose={onClose} />);
  
  vi.advanceTimersByTime(3000); // Fast-forward 3 seconds
  
  expect(onClose).toHaveBeenCalled();
});
```

For user interactions, we temporarily switch to real timers:

```typescript
it('should handle clicks', async () => {
  vi.useRealTimers(); // Switch to real timers for user events
  
  const user = userEvent.setup();
  await user.click(button);
  
  vi.useFakeTimers(); // Restore fake timers
});
```

## Coverage

To view test coverage:

```bash
npx vitest run --coverage
```

## Best Practices

1. **Isolation**: Each test is independent with its own setup/teardown
2. **Descriptive Names**: Test names clearly describe what they test
3. **Comprehensive**: Tests cover happy paths, edge cases, and user interactions
4. **Fast**: All tests run in under 200ms total
5. **Maintainable**: Clear structure and comments where needed

## Troubleshooting

### Tests timing out
- Ensure `vi.useRealTimers()` is called for async user interactions
- Check that timers are properly restored with `vi.useFakeTimers()`

### Elements not found
- Use `screen.debug()` to see rendered HTML
- Check if elements are actually rendered
- Verify selectors match component output

### Flaky tests
- Avoid hard-coded delays
- Use `waitFor` for async operations
- Ensure proper cleanup in `afterEach`
