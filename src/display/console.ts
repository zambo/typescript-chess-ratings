import type { LichessPlayer } from "../types/lichess.js";
import { LichessService } from "../services/lichess.js";
import { getDateRangeFilter } from "../utils/date.js";
import { DAYS_TO_FETCH } from "../constants/index.js";

export class ConsoleDisplay {
  private lichessService: LichessService;

  constructor(lichessService: LichessService) {
    this.lichessService = lichessService;
  }

  printTopPlayers(players: readonly LichessPlayer[]): void {
    console.log("\nTop 50 Classical Players:");
    players.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username}`);
    });
  }

  async printRatingHistoryForTopPlayer(
    topPlayer: LichessPlayer
  ): Promise<void> {
    console.log(`\nFetching rating history for ${topPlayer.username}...`);

    const classicalHistory =
      await this.lichessService.getClassicalRatingHistory(topPlayer.username);
    if (!classicalHistory) {
      console.log("No classical rating history found");
      return;
    }

    const thirtyDaysAgo = getDateRangeFilter(DAYS_TO_FETCH);
    const recentPoints = classicalHistory.points.filter((point) => {
      const pointDate = new Date(point[0], point[1], point[2]).getTime();
      return pointDate >= thirtyDaysAgo;
    });

    console.log(
      `\nRating history for ${topPlayer.username} (last ${DAYS_TO_FETCH} days):`
    );

    const ratingsByDate: Record<string, number> = {};
    recentPoints.forEach((point) => {
      const date = new Date(point[0], point[1], point[2]).toLocaleDateString();
      ratingsByDate[date] = point[3];
    });

    console.log(`${topPlayer.username}, ${JSON.stringify(ratingsByDate)}`);
  }
}
