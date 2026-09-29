/**
 * Concurrency limiter for the live /options matrix.
 *
 * The matrix is ~10k independent pre-flight calls; run one at a time the job is
 * pure network wait. Tests are scheduled concurrently and this caps how many
 * requests are in flight, so the gateway sees a steady N rather than a burst of
 * thousands.
 */
export type Limiter = <T>(fn: () => Promise<T>) => Promise<T>;

export function createLimiter(max: number): Limiter {
  if (!Number.isInteger(max) || max < 1) throw new Error(`concurrency must be a positive integer, got ${max}`);
  let active = 0;
  const queue: Array<() => void> = [];

  // A finished call hands its slot straight to the next waiter rather than
  // freeing it, so a newcomer can't slip in between and overshoot `max`.
  const release = () => {
    const next = queue.shift();
    if (next) next();
    else active--;
  };

  return async (fn) => {
    if (active < max) active++;
    else await new Promise<void>((resolve) => queue.push(resolve));
    try {
      return await fn();
    } finally {
      release();
    }
  };
}
