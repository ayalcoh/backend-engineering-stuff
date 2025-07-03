# Development Guide

This file provides development guidance and project documentation for this repository.

## Development Commands

### Build and Test
- `npm run build` - Compile TypeScript to JavaScript in dist/
- `npm test` - Run all Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run typecheck` - Type check without emitting files

### Code Quality
- `npm run lint` - Lint main source files (src/*.ts)
- `npm run lint:all` - Lint all TypeScript files including tests
- `npm run lint:fix` - Auto-fix linting issues where possible

### Running Individual Tests
- `npm test -- question1.test.ts` - Run specific test file
- `npm test -- --testNamePattern="concurrent"` - Run tests matching pattern

## Project Architecture

This is a backend engineering test project with three independent algorithmic solutions:

### Question 1: Thread-Safe Caching (`src/question1.ts`)
- **Problem**: Race conditions in concurrent cache access
- **Solution**: Promise caching with in-flight request deduplication
- **Key Pattern**: Uses dual Maps - one for cached results, one for pending promises
- **Testing**: Mock `readConfigFromDb` function, extensive concurrent scenario testing


### Question 2: Stream Processing (`src/question2.ts`)
- **Problem**: Process large UTF-8 streams of semicolon-delimited data
- **Solution**: Two implementations - callback-based and AsyncGenerator
- **Key Pattern**: Buffer management for partial data chunks, pagination with PAGE_SIZE=10
- **Dependencies**: Node.js streams, uses `setEncoding('utf8')` when available

### Question 3: Weighted Random Selection (`src/question3.ts`)
- **Problem**: Fair weighted random selection using only Math.random()
- **Solution**: Cumulative distribution function algorithm
- **Key Pattern**: Pre-computed cumulative weights array for O(n) selection
- **Edge Cases**: Zero weights allowed, comprehensive input validation

## Code Patterns

### Error Handling
- Input validation with descriptive error messages
- Proper error propagation in async contexts
- Type guards for runtime safety

### Testing Strategy
- Comprehensive Jest test suite with 45+ test cases
- Mock external dependencies (database calls, streams)
- Concurrent scenario testing with Promise.all
- Statistical distribution testing for randomization
- Edge case coverage (empty inputs, invalid data, error conditions)

### TypeScript Configuration
- Strict mode enabled with comprehensive checks
- Source maps and declarations generated
- Excludes test files from compilation output

### ESLint Configuration
- TypeScript-aware linting with @typescript-eslint
- Enforces type safety and code quality standards
- Configured for both source and test files
- Rules include: no unused variables, explicit any warnings, prefer const, no var declarations

## Quality Assurance

Before committing changes, ensure all quality checks pass:

```bash
npm run build && npm run typecheck && npm run lint && npm test
```

This runs:
1. **Build** - Ensures TypeScript compiles without errors
2. **Type Check** - Validates type safety without emitting files
3. **Lint** - Checks code quality and style
4. **Test** - Runs all 45+ tests to ensure functionality

All checks must pass for a clean, production-ready codebase.