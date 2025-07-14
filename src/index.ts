// Modern modular architecture with proper separation of concerns
import { LichessService } from "./services/lichess.js";
import { ConsoleDisplay } from "./display/console.js";
import { CSVGenerator } from "./output/csv.js";
import { RateLimiter } from "./utils/rate-limiter.js";
import {
  LichessAPIError,
  NetworkError,
  RateLimitError,
  ValidationError,
} from "./errors/index.js";

// Initialize services and utilities
const lichessService = new LichessService();
const consoleDisplay = new ConsoleDisplay(lichessService);
const rateLimiter = new RateLimiter();
const csvGenerator = new CSVGenerator(lichessService, rateLimiter);

async function main() {
  try {
    // Step 1: List top 50 players
    const topPlayers = await lichessService.getTopClassicalPlayers();
    consoleDisplay.printTopPlayers(topPlayers);

    if (topPlayers.length === 0) {
      console.log("No players found");
      return;
    }

    // Step 2: Print rating history for top player
    const topPlayer = topPlayers[0];
    if (topPlayer) {
      await consoleDisplay.printRatingHistoryForTopPlayer(topPlayer);
    }

    // Step 3: Generate CSV for all players
    const csvRows = await csvGenerator.generateCSVForAllPlayers(topPlayers);
    await csvGenerator.writeCSVToFile(csvRows);
  } catch (error) {
    if (error instanceof LichessAPIError) {
      console.error(
        `Lichess API error (${error.statusCode}): ${error.message}`,
        error.endpoint ? `- Endpoint: ${error.endpoint}` : ""
      );
      process.exit(2);
    } else if (error instanceof NetworkError) {
      console.error(`Network error: ${error.message}`);
      if (error.originalError) {
        console.error("Original error:", error.originalError.message);
      }
      process.exit(3);
    } else if (error instanceof RateLimitError) {
      console.error(`Rate limit exceeded: ${error.message}`);
      if (error.retryAfter) {
        console.error(`Retry after: ${error.retryAfter}ms`);
      }
      process.exit(4);
    } else if (error instanceof ValidationError) {
      console.error(`Validation error: ${error.message}`);
      process.exit(5);
    } else {
      console.error("Unexpected error:", error);
      process.exit(1);
    }
  }
}

// Entry point - clean and focused main function
await main();
