# Backend Engineering Test Solutions

## Setup
```bash
npm install
npm test
```

## Solutions

### Question 1: Thread-Safe Caching
**Problem**: Race condition in concurrent cache access causing duplicate database calls  
**Solution**: Promise caching to ensure only one DB request per roomId at a time

### Question 2: Stream Processing  
**Problem**: Process large achievement streams efficiently without memory overload  
**Solution**: 
- Part A: Callback-based stream processor with UTF-8 and semicolon delimiter handling
- Part B: AsyncGenerator implementation for cleaner async iteration

### Question 3: Weighted Random Selection
**Problem**: Implement fair weighted "Spin the Wheel" selection using only Math.random()  
**Solution**: Cumulative distribution function algorithm with O(n) selection time

## Project Structure
```
src/
├── question1.ts          # Caching solution
├── question2.ts          # Stream processing solutions  
├── question3.ts          # Weighted random selection
└── tests/                # Comprehensive test suite
    ├── question1.test.ts
    ├── question2.test.ts
    └── question3.test.ts
```

## Technical Features
- TypeScript with strict configuration
- Comprehensive error handling and input validation
- 45 test cases covering edge cases and concurrent scenarios
- Production-ready code quality