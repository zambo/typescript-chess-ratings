// TODO: [refactor] move constants to a separate config file
const LICHESS_API_BASE = "https://lichess.org/api";
const DAYS_TO_FETCH = 30;

// Basic types for Lichess API responses

/* TODO:
 ** [important] use a schema validation library like zod
 ** [refactor] move type definitions to a separate file
 */

type LichessPlayer = Readonly<{
  id: string;
  username: string;
  title?: string;
  perfs: {
    classical: {
      rating: number;
      progress: number;
    };
  };
}>;

type TopPlayersResponse = Readonly<{
  users: readonly LichessPlayer[];
}>;

type RatingPoint = Readonly<{
  0: number; // year
  1: number; // month (0-indexed: 0=January, 11=December)
  2: number; // day
  3: number; // rating
}>;

type RatingHistoryResponse = Readonly<{
  name: string;
  points: readonly RatingPoint[];
}>;

/* TODO: implement proper error handling
 ** [important] create custom error types (NetworkError, RateLimitError, ValidationError)
 ** [important] add exponential backoff retry mechanism with jitter
 ** [nice-to-have] implement structured logging (winston/pino) with request metadata
 */
async function fetchWithBasicErrorHandling(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error);
    throw error;
  }
}

/* TODO: improve data fetching and presentation
 ** [refactor] separate data fetching from console output (single responsibility)
 ** [important] add input validation for API responses (structure can change)
 ** [nice-to-have] implement basic caching for repeated requests within session
 ** [refactor] add data transformation layer to normalize API responses
 */
async function fetchTopClassicalPlayers(): Promise<readonly LichessPlayer[]> {
  console.log("Fetching top 50 classical players...");
  const data: TopPlayersResponse = await fetchWithBasicErrorHandling(
    `${LICHESS_API_BASE}/player/top/50/classical`,
  );

  // Print usernames as requested
  console.log("\nTop 50 Classical Players:");
  data.users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.username}`);
  });

  return data.users;
}

async function printRatingHistoryForTopPlayer(
  topPlayer: LichessPlayer,
): Promise<void> {
  console.log(`\nFetching rating history for ${topPlayer.username}...`);

  const data: RatingHistoryResponse[] = await fetchWithBasicErrorHandling(
    `${LICHESS_API_BASE}/user/${topPlayer.username}/rating-history`,
  );

  // Find classical ratings
  const classicalHistory = data.find(
    (category) => category.name === "Classical",
  );
  if (!classicalHistory) {
    console.log("No classical rating history found");
    return;
  }

  // TODO: improve date handling and data transformation
  // ** [important] use date-fns or dayjs for reliable date calculations
  // ** [refactor] create utility functions for date range filtering
  // ** [nice-to-have] implement proper timezone handling
  // ** [enhancement] add data interpolation for missing days (fill gaps)
  const thirtyDaysAgo = Date.now() - DAYS_TO_FETCH * 24 * 60 * 60 * 1000;
  const recentPoints = classicalHistory.points.filter((point) => {
    // Convert [year, month, day, rating] to timestamp for comparison
    const pointDate = new Date(point[0], point[1], point[2]).getTime();
    return pointDate >= thirtyDaysAgo;
  });

  // Format output
  console.log(
    `\nRating history for ${topPlayer.username} (last ${DAYS_TO_FETCH} days):`,
  );
  const ratingsByDate: Record<string, number> = {};

  recentPoints.forEach((point) => {
    // Convert [year, month, day, rating] to a proper date
    const date = new Date(point[0], point[1], point[2]).toLocaleDateString();
    ratingsByDate[date] = point[3]; // rating is at index 3
  });

  console.log(`${topPlayer.username}, ${JSON.stringify(ratingsByDate)}`);
}

/* TODO: enhance CSV generation and performance
 ** [enhancement] use fast-csv or csv-writer library for proper escaping
 ** [performance] implement concurrent request processing with rate limiting (Promise.allSettled)
 ** [nice-to-have] add progress indicators for long-running operations
 ** [important] write output to file with configurable path
 ** [testing] add basic testing for data transformation logic
 */
async function generateCSVForAllPlayers(
  players: readonly LichessPlayer[],
): Promise<void> {
  console.log("\nGenerating CSV for all players...");

  const csvRows: string[] = [];
  const headers = ["username"];

  // Add date headers for each day (30 days ago to today)
  for (let i = 29; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    headers.push(date.toISOString().split("T")[0]);
  }

  csvRows.push(headers.join(","));

  // TODO: implement proper concurrent processing
  // ** [performance] use Promise.allSettled with batching (e.g., 5 concurrent requests)
  // ** [important] add simple rate limiter to respect API limits
  for (const player of players.slice(0, 5)) {
    // Limiting to 5 for demo to avoid rate limits
    try {
      console.log(`Processing ${player.username}...`);

      const data: RatingHistoryResponse[] = await fetchWithBasicErrorHandling(
        `${LICHESS_API_BASE}/user/${player.username}/rating-history`,
      );

      const classicalHistory = data.find(
        (category) => category.name === "Classical",
      );
      if (!classicalHistory) continue;

      const thirtyDaysAgo = Date.now() - DAYS_TO_FETCH * 24 * 60 * 60 * 1000;
      const recentPoints = classicalHistory.points.filter((point) => {
        // Convert [year, month, day, rating] to timestamp for comparison
        const pointDate = new Date(point[0], point[1], point[2]).getTime();
        return pointDate >= thirtyDaysAgo;
      });

      const row = [player.username];

      // Get current rating as fallback
      const currentRating = player.perfs.classical.rating;
      const fallbackRating = currentRating || 1500; // Default rating if none found

      // TODO: 🔥 CRITICAL - fix date alignment algorithm (currently broken)
      // ** [critical] implement proper daily rating interpolation
      // ** [important] handle missing data points with forward/backward fill
      // ** [critical] align ratings to actual calendar dates, not just indices
      for (let i = 0; i < 30; i++) {
        const pointIndex = Math.floor((i / 29) * (recentPoints.length - 1));
        const rating = recentPoints[pointIndex]
          ? recentPoints[pointIndex][3] // rating is at index 3
          : fallbackRating;
        row.push(rating.toString());
      }

      csvRows.push(row.join(","));

      // Basic rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Failed to process ${player.username}:`, error);
    }
  }

  // Write CSV to dist folder with timestamp
  const fs = require('fs');
  const path = require('path');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const distDir = 'dist';
  const filename = `chess-ratings-${timestamp}.csv`;
  const filepath = path.join(distDir, filename);
  
  try {
    // Create dist directory if it doesn't exist
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }
    
    fs.writeFileSync(filepath, csvRows.join('\n'), 'utf8');
    console.log(`\nCSV written to: ${filepath}`);
    console.log(`Processed ${csvRows.length - 1} players successfully`);
  } catch (error) {
    console.error('Failed to write CSV file:', error);
    console.log("\nFallback - CSV Output:");
    csvRows.forEach((row) => console.log(row));
  }
}

async function main() {
  try {
    // Step 1: List top 50 players
    const topPlayers = await fetchTopClassicalPlayers();

    if (topPlayers.length === 0) {
      console.log("No players found");
      return;
    }

    // Step 2: Print rating history for top player
    await printRatingHistoryForTopPlayer(topPlayers[0]);

    // Step 3: Generate CSV for all players
    await generateCSVForAllPlayers(topPlayers);
  } catch (error) {
    // TODO: improve error handling and logging
    // ** [important] add structured logging with context
    // ** [enhancement] implement proper exit codes for different error types
    // ** [refactor] add error categorization (network, validation, etc.)
    console.error("Application error:", error);
    process.exit(1);
  }
}

/* TODO: enhance CLI application features
 ** [enhancement] add command line argument parsing with commander.js (--output, --limit, --format)
 ** [refactor] implement configuration management (env vars, config files)
 ** [nice-to-have] add graceful shutdown handling (SIGTERM, SIGINT)
 ** [refactor] implement proper logging configuration
 ** [testing] add basic unit tests for core functions
 */
main();
