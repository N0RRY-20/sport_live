import { MATCH_STATUS } from "../validation/matches.js";

/**
 * Determines the current status of a match from its start and end times.
 * @param {string|Date} startTime - The match start time.
 * @param {string|Date} endTime - The match end time.
 * @param {Date} [now=new Date()] - The time used to determine the status.
 * @return {string|null} The match status, or `null` if either time is invalid.
 */
export function getMatchStatus(startTime, endTime, now = new Date()) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  if (now < start) {
    return MATCH_STATUS.SCHEDULED;
  }

  if (now >= end) {
    return MATCH_STATUS.FINISHED;
  }

  return MATCH_STATUS.LIVE;
}

/**
 * Synchronize a match's status with its current time-based status.
 * @param {Object} match - Match containing start, end, and current status values.
 * @param {Function} updateStatus - Persists the updated status.
 * @return {string} The match's current status.
 */
export async function syncMatchStatus(match, updateStatus) {
  const nextStatus = getMatchStatus(match.startTime, match.endTime);
  if (!nextStatus) {
    return match.status;
  }

  if (match.status !== nextStatus) {
    await updateStatus(nextStatus);
    match.status = nextStatus;
  }

  return match.status;
}
