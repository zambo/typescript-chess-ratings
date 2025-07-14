import { DAYS_TO_FETCH } from "../constants/index.js";

export function generateDateRange(days: number = DAYS_TO_FETCH): string[] {
  const dates: string[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split("T")[0];
    if (dateStr) {
      dates.push(dateStr);
    }
  }

  return dates;
}

export function createDateHeaders(days: number = DAYS_TO_FETCH): string[] {
  return ["username", ...generateDateRange(days)];
}

export function fillRatingsForDateRange(
  ratingPoints: [number, number, number, number][],
  fallbackRating: number,
  days: number = DAYS_TO_FETCH
): string[] {
  const ratingsByDate = new Map<string, number>();

  // Create a map of date -> rating from the rating history
  ratingPoints.forEach((point) => {
    const date = new Date(point[0], point[1], point[2]);
    const dateStr = date.toISOString().split("T")[0];
    if (dateStr) {
      ratingsByDate.set(dateStr, point[3]);
    }
  });

  const ratings: string[] = [];

  // Fill in daily ratings for the specified number of days
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split("T")[0];
    if (!dateStr) continue;

    let rating = ratingsByDate.get(dateStr);

    // If no rating for this date, use forward fill from previous known rating
    if (!rating) {
      // Look backwards for the most recent rating
      for (let j = i + 1; j < days; j++) {
        const prevDate = new Date(Date.now() - j * 24 * 60 * 60 * 1000);
        const prevDateStr = prevDate.toISOString().split("T")[0];
        if (!prevDateStr) continue;
        const prevRating = ratingsByDate.get(prevDateStr);
        if (prevRating) {
          rating = prevRating;
          break;
        }
      }
      // If still no rating found, use the fallback rating
      rating ??= fallbackRating;
    }

    ratings.push(rating.toString());
  }

  return ratings;
}

export function getDateRangeFilter(days: number = DAYS_TO_FETCH): number {
  return Date.now() - days * 24 * 60 * 60 * 1000;
}
