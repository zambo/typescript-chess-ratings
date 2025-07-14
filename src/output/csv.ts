import type { LichessPlayer } from "../types/lichess.js";
import { LichessService } from "../services/lichess.js";
import { RateLimiter } from "../utils/rate-limiter.js";
import {
  createDateHeaders,
  fillRatingsForDateRange,
  getDateRangeFilter,
} from "../utils/date.js";
import { DAYS_TO_FETCH, DEFAULT_RATING } from "../constants/index.js";

export class CSVGenerator {
  private lichessService: LichessService;
  private rateLimiter: RateLimiter;

  constructor(lichessService: LichessService, rateLimiter: RateLimiter) {
    this.lichessService = lichessService;
    this.rateLimiter = rateLimiter;
  }

  async generateCSVForAllPlayers(
    players: readonly LichessPlayer[]
  ): Promise<string[]> {
    console.log("\nGenerating CSV for all players...");

    const csvRows: string[] = [];
    const headers = createDateHeaders(DAYS_TO_FETCH);
    csvRows.push(headers.join(","));

    // Process all players concurrently with rate limiting
    const processingPromises = players.map((player) =>
      this.rateLimiter.add(async () => {
        return this.processPlayerRatings(player);
      })
    );

    // Use Promise.allSettled to handle both successful and failed requests
    const results = await Promise.allSettled(processingPromises);

    // Process results and add successful ones to CSV
    results.forEach((result, index) => {
      if (result.status === "fulfilled" && result.value) {
        csvRows.push(result.value);
      } else if (result.status === "rejected") {
        const player = players[index];
        if (player) {
          console.error(`Failed to process ${player.username}:`, result.reason);
        }
      }
    });

    return csvRows;
  }

  private async processPlayerRatings(
    player: LichessPlayer
  ): Promise<string | null> {
    console.log(`Processing ${player.username}...`);

    const classicalHistory =
      await this.lichessService.getClassicalRatingHistory(player.username);
    if (!classicalHistory?.points) {
      return null;
    }

    const thirtyDaysAgo = getDateRangeFilter(DAYS_TO_FETCH);
    const recentPoints = classicalHistory.points.filter((point) => {
      const pointDate = new Date(point[0], point[1], point[2]).getTime();
      return pointDate >= thirtyDaysAgo;
    });

    const fallbackRating = player.perfs.classical.rating || DEFAULT_RATING;
    const ratings = fillRatingsForDateRange(
      recentPoints,
      fallbackRating,
      DAYS_TO_FETCH
    );

    return [player.username, ...ratings].join(",");
  }

  async writeCSVToFile(csvRows: string[]): Promise<void> {
    const fs = await import("fs");
    const path = await import("path");

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const distDir = "dist";
    const filename = `chess-ratings-${timestamp}.csv`;
    const filepath = path.join(distDir, filename);

    try {
      // Create dist directory if it doesn't exist
      if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
      }

      fs.writeFileSync(filepath, csvRows.join("\n"), "utf8");
      console.log(`\nCSV written to: ${filepath}`);
      console.log(`Processed ${csvRows.length - 1} players successfully`);
    } catch (error) {
      console.error("Failed to write CSV file:", error);
      console.log("\nFallback - CSV Output:");
      csvRows.forEach((row) => console.log(row));
    }
  }
}
