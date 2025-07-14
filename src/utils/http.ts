import { z } from "zod";
import {
  LichessAPIError,
  NetworkError,
  RateLimitError,
  ValidationError,
} from "../errors/index.js";
import { DEFAULT_MAX_RETRIES, DEFAULT_BASE_DELAY } from "../constants/index.js";

export async function fetchWithRetry<T>(
  url: string,
  schema: z.ZodSchema<T>,
  maxRetries: number = DEFAULT_MAX_RETRIES,
  baseDelay: number = DEFAULT_BASE_DELAY
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url);

      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        const retryDelay = retryAfter ? parseInt(retryAfter) * 1000 : baseDelay;

        if (attempt === maxRetries) {
          throw new RateLimitError(
            `Rate limit exceeded for ${url}`,
            retryDelay
          );
        }

        console.log(`Rate limited. Retrying in ${retryDelay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        continue;
      }

      if (!response.ok) {
        throw new LichessAPIError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          url
        );
      }

      const data = await response.json();

      // Validate the response data using the provided schema
      const validatedData = schema.parse(data);
      return validatedData;
    } catch (error) {
      if (error instanceof LichessAPIError || error instanceof RateLimitError) {
        throw error;
      }

      if (error instanceof z.ZodError) {
        throw new ValidationError(
          `Invalid response format from ${url}: ${error.message}`,
          error.issues
        );
      }

      if (attempt === maxRetries) {
        throw new NetworkError(
          `Failed to fetch ${url} after ${maxRetries + 1} attempts`,
          error as Error
        );
      }

      // Exponential backoff with jitter
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
        10000
      );

      console.log(`Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new NetworkError(`Max retries exceeded for ${url}`);
}
