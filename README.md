# Chess Player Ratings Exporter

A TypeScript application that fetches chess player ratings from the Lichess API and exports historical rating data to CSV format.

## What it does

- Fetches the top 50 classical chess players from Lichess
- Displays their rating history for the last 30 days
- Generates a CSV file with daily ratings for analysis

## Quick Start

### Dependencies

- Node.js (with experimental TypeScript support)
- No external dependencies - uses built-in modules only

### Installation

```bash
npm install
```

### Running the application

```bash
node --experimental-strip-types src/index.ts
```

The application will:

1. List the top 50 classical players
2. Show rating history for the #1 player
3. Generate a timestamped CSV file in the `dist/` folder

### Output

CSV format: `username,2025-06-12,2025-06-13,...,2025-07-11`

- First column: Player username
- Subsequent columns: Rating on each date

## Development Notes

This was built with a focus on **speed and functionality**. The code includes extensive TODO comments throughout `src/index.ts` outlining potential improvements for production use, including:

- Error handling enhancements
- Performance optimizations
- Data validation
- Testing strategies
- CLI improvements
