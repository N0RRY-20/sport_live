import { z } from 'zod';

/**
 * Constant representing possible match status values in lowercase
 */
export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  FINISHED: 'finished',
};

/**
 * Helper function to validate ISO date strings
 * @param {string} val
 * @returns {boolean}
 */
const isValidIsoDate = (val) => {
  if (typeof val !== 'string' || val.trim() === '') return false;
  const timestamp = Date.parse(val);
  return !isNaN(timestamp);
};

/**
 * Schema for validating query parameters when listing matches
 * - limit: optional coerced positive integer with a maximum of 100
 */
export const listMatchesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

/**
 * Schema for validating match ID route parameters
 * - id: required coerced positive integer
 */
export const matchIdParamSchema = z.object({
  id: z.coerce.number().int().positive({ message: 'Match ID must be a positive integer' }),
});

/**
 * Schema for creating a new match fixture
 * - sport, homeTeam, awayTeam: non-empty strings
 * - startTime, endTime: strings refined to valid ISO date strings
 * - superRefine: endTime must be chronologically after startTime
 * - homeScore, awayScore: optional coerced non-negative integers
 */
export const createMatchSchema = z
  .object({
    sport: z.string().trim().min(1, { message: 'Sport is required and cannot be empty' }),
    homeTeam: z.string().trim().min(1, { message: 'Home team is required and cannot be empty' }),
    awayTeam: z.string().trim().min(1, { message: 'Away team is required and cannot be empty' }),
    startTime: z.string().refine(isValidIsoDate, {
      message: 'startTime must be a valid ISO date string',
    }),
    endTime: z.string().refine(isValidIsoDate, {
      message: 'endTime must be a valid ISO date string',
    }),
    homeScore: z.coerce.number().int().nonnegative().optional(),
    awayScore: z.coerce.number().int().nonnegative().optional(),
  })
  .superRefine((data, ctx) => {
    const startTimeMs = new Date(data.startTime).getTime();
    const endTimeMs = new Date(data.endTime).getTime();

    if (!isNaN(startTimeMs) && !isNaN(endTimeMs) && endTimeMs <= startTimeMs) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'endTime must be chronologically after startTime',
        path: ['endTime'],
      });
    }
  });

/**
 * Schema for updating match scores
 * - homeScore, awayScore: required coerced non-negative integers
 */
export const updateScoreSchema = z.object({
  homeScore: z.coerce
    .number()
    .int({ message: 'Home score must be an integer' })
    .nonnegative({ message: 'Home score must be a non-negative integer' }),
  awayScore: z.coerce
    .number()
    .int({ message: 'Away score must be an integer' })
    .nonnegative({ message: 'Away score must be a non-negative integer' }),
});
