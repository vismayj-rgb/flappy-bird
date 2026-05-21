# Tests

This directory contains all test files for the Flappy Bird game.

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm test -- --coverage
```

## Test Structure

Tests are organized by module:

- `bird.test.js` - Tests for the Bird entity
- `collision.test.js` - Tests for collision detection
- `score.test.js` - Tests for score management
- `storage.test.js` - Tests for localStorage operations (to be added)
- `pipe.test.js` - Tests for pipe generation (to be added)

## Test Coverage Goals

Aim for:
- **Lines**: > 80%
- **Functions**: > 80%
- **Branches**: > 75%
- **Statements**: > 80%

## Writing Tests

### Test File Naming

Test files should:
- End with `.test.js`
- Match the name of the file they're testing
- Be placed in the `tests/` directory

Example:
- Source: `src/entities/bird.js`
- Test: `tests/bird.test.js`

### Test Structure

Follow this structure for tests:

```javascript
describe('ModuleName', () => {
  let instance;

  beforeEach(() => {
    // Setup before each test
    instance = new ModuleName();
  });

  afterEach(() => {
    // Cleanup after each test
  });

  describe('FeatureName', () => {
    test('should do something specific', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = instance.doSomething(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### Best Practices

1. **One assertion per test** (when possible)
2. **Use descriptive test names** that explain what's being tested
3. **Follow Arrange-Act-Assert** pattern
4. **Mock external dependencies** (localStorage, DOM, etc.)
5. **Test edge cases** and error conditions
6. **Keep tests isolated** - each test should be independent

### Mocking

#### Mocking localStorage

```javascript
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    clear: () => { store = {}; }
  };
})();

global.localStorage = localStorageMock;
```

#### Mocking Canvas

```javascript
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
```

#### Mocking Audio

```javascript
global.soundManager = {
  playJump: jest.fn(),
  playScore: jest.fn()
};
```

## Common Matchers

```javascript
// Equality
expect(value).toBe(expected);
expect(value).toEqual(expected);

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();

// Numbers
expect(value).toBeGreaterThan(3);
expect(value).toBeLessThan(5);
expect(value).toBeCloseTo(0.3, 2);

// Strings
expect(string).toMatch(/regex/);

// Arrays
expect(array).toContain(item);
expect(array).toHaveLength(3);

// Objects
expect(object).toHaveProperty('key');

// Functions
expect(fn).toHaveBeenCalled();
expect(fn).toHaveBeenCalledWith(arg1, arg2);
```

## Testing Checklist

When writing tests, ensure you cover:

- [ ] Happy path scenarios
- [ ] Edge cases
- [ ] Error conditions
- [ ] Boundary conditions
- [ ] State changes
- [ ] Side effects
- [ ] Return values
- [ ] Callbacks/events

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://testingjavascript.com/)
- [JavaScript Testing Guide](https://github.com/goldbergyoni/javascript-testing-best-practices)
