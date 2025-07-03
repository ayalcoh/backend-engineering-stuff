# Backend Engineering Solutions

A collection of TypeScript utilities for common backend challenges including caching, stream processing, and weighted random selection.

## Features

### Thread-Safe Caching
High-performance caching solution with promise deduplication to prevent race conditions in concurrent environments.

### Stream Processing  
Efficient processing of large UTF-8 data streams with buffer management and pagination support.

### Weighted Random Selection
Fair weighted random selection algorithm using cumulative distribution for consistent results.

## Installation

```bash
npm install
```

## Usage

```bash
# Build the project
npm run build

# Run tests
npm test

# Type checking
npm run typecheck

# Code quality
npm run lint              # Lint main source files
npm run lint:all          # Lint all TypeScript files (including tests)
npm run lint:fix          # Auto-fix linting issues
```

## Architecture

Built with TypeScript using strict mode for type safety. Comprehensive test coverage with Jest including concurrent scenario testing and statistical validation. Code quality enforced with ESLint and TypeScript strict checks.

## License

MIT