# Chess Player Ratings Exporter

A production-ready TypeScript application that fetches chess player ratings from the Lichess API and exports historical rating data to CSV format.

## Features

- 🏆 Fetches the top 50 classical chess players from Lichess
- 📊 Displays rating history for the top player (last 30 days)
- 📁 Generates timestamped CSV files with daily ratings for all players
- 🚀 **High Performance**: Concurrent API calls with intelligent rate limiting
- 🛡️ **Robust**: Comprehensive error handling with retry mechanisms
- ✅ **Type Safe**: Full TypeScript with strict type checking
- 🔍 **Validated**: Runtime data validation using Zod schemas
- 🏗️ **Modular**: Clean architecture with separation of concerns

## Architecture

```
src/
├── constants/          # Configuration constants
├── types/             # TypeScript types and Zod schemas
├── errors/            # Custom error classes
├── utils/             # Utility functions (HTTP, rate limiting, dates)
├── services/          # API service layer
├── output/            # Data output handlers (CSV generation)
├── display/           # Console output handlers
└── index.ts          # Main entry point
```

## Quick Start

### Dependencies

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Running the application

```bash
# Development (with TypeScript)
npm run dev

# Production (compiled)
npm run build
npm start
```

### Available Scripts

```bash
npm run build          # Compile TypeScript to JavaScript
npm run dev            # Run in development mode
npm start              # Run compiled application
npm run lint           # Check code quality
npm run lint:fix       # Fix linting issues
npm run format         # Format code with Prettier
npm run format:check   # Check code formatting
npm run type-check     # TypeScript type checking
npm test               # Run tests
npm run test:coverage  # Run tests with coverage
```

## Output

The application generates CSV files in the `dist/` folder with the format:
`chess-ratings-YYYY-MM-DDTHH-mm-ss-sssZ.csv`

**CSV structure:**

- First column: Player username
- Subsequent columns: Daily rating for the last 30 days
- Missing ratings are forward-filled from the most recent known rating

## Development Tools

### Code Quality

- **ESLint**: Strict linting with TypeScript rules
- **Prettier**: Consistent code formatting
- **TypeScript**: Strict mode with comprehensive type checking

### Pre-commit Hooks

- **Husky**: Git hooks for quality assurance
- **lint-staged**: Automatic linting and formatting on commit

### Testing

- **Jest**: Testing framework with coverage reports
- **ts-jest**: TypeScript support for Jest

### CI/CD

- **GitHub Actions**: Automated testing, linting, and building
- Multi-Node.js version testing (18.x, 20.x, 22.x)
- Security auditing and dependency checks

## Technical Improvements

### Performance ⚡

- **Concurrent Processing**: All 50 players processed simultaneously (vs. sequential in original)
- **Rate Limiting**: Intelligent queuing with configurable concurrency
- **Retry Logic**: Exponential backoff with jitter for failed requests

### Reliability 🛡️

- **Error Handling**: Custom error types for different failure modes
- **Data Validation**: Runtime validation of API responses using Zod
- **Type Safety**: Strict TypeScript configuration with comprehensive checks

### Code Quality 🏗️

- **Modular Architecture**: Clean separation of concerns
- **Maintainable**: ESLint + Prettier + strict TypeScript
- **Testable**: Jest setup with coverage reporting
- **Documented**: Comprehensive README and inline documentation

### Fixed Issues 🐛

- **Date Alignment**: Proper calendar date mapping (was broken in original)
- **Missing Data Handling**: Forward-fill algorithm for missing rating points
- **Concurrency**: Processes all 50 players instead of limiting to 5
- **Error Recovery**: Graceful handling of API failures and rate limits

## Configuration

Key constants can be modified in `src/constants/index.ts`:

```typescript
export const LICHESS_API_BASE = "https://lichess.org/api";
export const DAYS_TO_FETCH = 30;
export const DEFAULT_RATING = 1500;
export const DEFAULT_MAX_RETRIES = 3;
export const DEFAULT_RATE_LIMIT_CONCURRENT = 5;
export const DEFAULT_RATE_LIMIT_DELAY = 200;
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run the full test suite: `npm run lint && npm run type-check && npm test`
5. Submit a pull request

The pre-commit hooks will automatically run linting and formatting checks.

## License

This project is open source and available under the [MIT License](LICENSE).
