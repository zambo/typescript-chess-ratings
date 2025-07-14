import { z } from "zod";
import { fetchWithRetry } from "../utils/http.js";
import type { LichessPlayer, RatingHistoryResponse } from "../types/lichess.js";
import {
  TopPlayersResponseSchema,
  RatingHistoryResponseSchema,
} from "../types/lichess.js";
import { LICHESS_API_BASE } from "../constants/index.js";

export class LichessService {
  async getTopClassicalPlayers(): Promise<readonly LichessPlayer[]> {
    console.log("Fetching top 50 classical players...");
    const data = await fetchWithRetry(
      `${LICHESS_API_BASE}/player/top/50/classical`,
      TopPlayersResponseSchema
    );

    return data.users;
  }

  async getRatingHistory(username: string): Promise<RatingHistoryResponse[]> {
    return fetchWithRetry(
      `${LICHESS_API_BASE}/user/${username}/rating-history`,
      z.array(RatingHistoryResponseSchema)
    );
  }

  async getClassicalRatingHistory(
    username: string
  ): Promise<RatingHistoryResponse | null> {
    const data = await this.getRatingHistory(username);
    return data.find((category) => category.name === "Classical") ?? null;
  }
}
