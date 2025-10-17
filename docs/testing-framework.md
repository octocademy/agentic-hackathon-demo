# Testing Framework Documentation

## Overview

This document describes the testing framework chosen for the OctoCAT Supply Chain Management System and provides guidance on writing and running tests.

## Selected Testing Framework: Vitest

### What is Vitest?

Vitest is a blazing-fast unit test framework powered by Vite. It provides a modern, Jest-compatible API with native ES modules support, TypeScript integration, and excellent performance characteristics.

**Current Version**: The project uses Vitest 3.0.5 in the API and 3.1.1 in the frontend. These minor version differences are compatible and both provide the same core functionality.

### Why Vitest?

We selected Vitest as our testing framework for the following reasons:

#### 1. **Perfect Match for Our Stack**
- **Native Vite Integration**: Our project uses Vite as the build tool for the frontend, making Vitest a natural fit
- **TypeScript First**: Full TypeScript support out of the box, matching our codebase which is 100% TypeScript
- **ESM Support**: Native ES modules support without configuration hassles

#### 2. **Performance**
- **Fast Execution**: Vitest leverages Vite's transformation pipeline, making tests significantly faster than traditional test runners
- **Smart Watch Mode**: Intelligent file watching that only runs affected tests
- **Parallel Test Execution**: Tests run in parallel by default for faster feedback

#### 3. **Developer Experience**
- **Jest-Compatible API**: Familiar syntax for developers who have used Jest (`describe`, `it`, `expect`, `beforeEach`, etc.)
- **Excellent Error Messages**: Clear, actionable error messages with source maps support
- **Built-in Coverage**: Integrated coverage reporting with v8 (via @vitest/coverage-v8)
- **Hot Module Replacement**: Instant test reruns during development

#### 4. **Modern Features**
- **Component Testing**: Support for testing React components (with @testing-library/react)
- **Snapshot Testing**: Built-in snapshot testing capabilities
- **Mocking**: Powerful mocking utilities compatible with Jest mocks
- **UI Mode**: Optional graphical interface for viewing test results

#### 5. **Ecosystem Compatibility**
- Works seamlessly with popular testing utilities like:
  - Supertest (for API testing)
  - @testing-library/react (for React component testing)
  - @testing-library/user-event (for simulating user interactions)
  - jsdom (for browser environment simulation)

## Current Test Setup

### API Testing (Backend)

**Location**: `api/src/routes/`

**Configuration**: `api/vitest.config.ts`

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		globals: false,
		environment: 'node',
		coverage: {
			reporter: ['text', 'json', 'html'],
		},
	},
})
```

**Dependencies**:
- `vitest`: 3.0.5
- `@vitest/coverage-v8`: 3.0.5 (for coverage reporting)
- `supertest`: 7.0.0 (for HTTP API testing)
- `@types/supertest`: 6.0.2

**Example Test**: See `api/src/routes/branch.test.ts` for a complete example of API testing

### Frontend Testing (React)

**Status**: The frontend has all necessary Vitest and testing libraries installed, but no test script is configured in `frontend/package.json` and no tests have been written yet.

**Configuration**: Frontend can use Vitest with a configuration similar to the API setup. A `vitest.config.ts` file would need to be created in the frontend directory, or the existing `vite.config.ts` can be extended.

**Dependencies**:
- `vitest`: 3.1.1
- `@testing-library/react`: 16.3.0 (for component testing)
- `@testing-library/jest-dom`: 6.6.3 (for DOM matchers)
- `@testing-library/user-event`: 14.6.1 (for user interaction simulation)
- `jsdom`: 26.0.0 (for browser environment)

**To enable frontend testing**, add this to `frontend/package.json`:
```json
"scripts": {
  "test": "vitest"
}
```

## Running Tests

### Run All Tests
```bash
# Run tests across all workspaces that have tests configured
npm run test

# Run API tests (recommended)
npm run test:api
```

**Note**: The root `package.json` includes a `test:frontend` script, but it will fail because the frontend workspace doesn't have a `test` script defined in `frontend/package.json` yet. Currently, only the API workspace has a working test configuration.

### Run Tests with Coverage
```bash
# Run API tests with coverage report
npm run test:coverage --workspace=api
```

### Watch Mode
```bash
# Run API tests in watch mode
cd api && npx vitest

# Or use the test command with watch flag
cd api && npm run test -- --watch
```

## Writing Tests

### API Testing Pattern

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import yourRouter from './your-route';

let app: express.Express;

describe('Your API', () => {
    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/your-path', yourRouter);
        // Reset any data stores if needed
    });

    it('should handle GET request', async () => {
        const response = await request(app).get('/your-path');
        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
    });

    it('should handle POST request', async () => {
        const newData = { /* your data */ };
        const response = await request(app)
            .post('/your-path')
            .send(newData);
        expect(response.status).toBe(201);
        expect(response.body).toEqual(newData);
    });
});
```

### React Component Testing Pattern

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import YourComponent from './YourComponent';

describe('YourComponent', () => {
    it('should render correctly', () => {
        render(<YourComponent />);
        expect(screen.getByText('Expected Text')).toBeInTheDocument();
    });

    it('should handle user interaction', async () => {
        const user = userEvent.setup();
        render(<YourComponent />);
        
        const button = screen.getByRole('button', { name: /click me/i });
        await user.click(button);
        
        expect(screen.getByText('Updated Text')).toBeInTheDocument();
    });
});
```

## Best Practices

### 1. Test Organization
- Place test files next to the code they test with `.test.ts` or `.spec.ts` extension
- Use descriptive test names that explain the expected behavior
- Group related tests using `describe` blocks

### 2. Test Structure
- Follow the Arrange-Act-Assert (AAA) pattern:
  - **Arrange**: Set up test data and conditions
  - **Act**: Execute the code being tested
  - **Assert**: Verify the expected outcome

### 3. Test Independence
- Each test should be independent and not rely on other tests
- Use `beforeEach` to set up fresh state for each test
- Clean up after tests when necessary (using `afterEach`)

### 4. Coverage Guidelines
- Aim for meaningful coverage, not just high percentages
- Focus on critical paths and edge cases
- Don't test implementation details; test behavior

### 5. Mocking
- Mock external dependencies (APIs, databases, etc.)
- Use `vi.fn()` for function mocks
- Use `vi.mock()` for module mocks

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [Supertest Documentation](https://github.com/ladjs/supertest)

## Future Enhancements

As the project grows, consider adding:

1. **E2E Testing**: Implement end-to-end tests using Playwright (MCP server already available)
2. **Visual Regression Testing**: Add screenshot comparison tests for UI components
3. **Performance Testing**: Measure and track application performance metrics
4. **Contract Testing**: Ensure API contract compatibility between frontend and backend
5. **Mutation Testing**: Use tools like Stryker to validate test quality
