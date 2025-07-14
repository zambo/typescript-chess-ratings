import {
  DEFAULT_RATE_LIMIT_CONCURRENT,
  DEFAULT_RATE_LIMIT_DELAY,
} from "../constants/index.js";

export class RateLimiter {
  private queue: Array<() => Promise<void>> = [];
  private running = 0;
  private readonly maxConcurrent: number;
  private readonly minDelay: number;

  constructor(
    maxConcurrent: number = DEFAULT_RATE_LIMIT_CONCURRENT,
    minDelay: number = DEFAULT_RATE_LIMIT_DELAY
  ) {
    this.maxConcurrent = maxConcurrent;
    this.minDelay = minDelay;
  }

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const task = async (): Promise<void> => {
        try {
          this.running++;
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.running--;
          setTimeout(() => this.processQueue(), this.minDelay);
        }
      };

      this.queue.push(task);
      this.processQueue();
    });
  }

  private processQueue(): void {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const task = this.queue.shift();
    if (task) {
      void task();
    }
  }
}
