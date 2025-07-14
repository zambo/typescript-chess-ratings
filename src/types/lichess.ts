import { z } from "zod";

// Zod schemas for runtime validation
export const LichessPlayerSchema = z.object({
  id: z.string(),
  username: z.string(),
  title: z.string().optional(),
  perfs: z.object({
    classical: z.object({
      rating: z.number(),
      progress: z.number(),
    }),
  }),
});

export const TopPlayersResponseSchema = z.object({
  users: z.array(LichessPlayerSchema),
});

export const RatingPointSchema = z.tuple([
  z.number(), // year
  z.number(), // month (0-indexed: 0=January, 11=December)
  z.number(), // day
  z.number(), // rating
]);

export const RatingHistoryResponseSchema = z.object({
  name: z.string(),
  points: z.array(RatingPointSchema),
});

// Infer TypeScript types from zod schemas
export type LichessPlayer = z.infer<typeof LichessPlayerSchema>;
export type TopPlayersResponse = z.infer<typeof TopPlayersResponseSchema>;
export type RatingPoint = z.infer<typeof RatingPointSchema>;
export type RatingHistoryResponse = z.infer<typeof RatingHistoryResponseSchema>;
