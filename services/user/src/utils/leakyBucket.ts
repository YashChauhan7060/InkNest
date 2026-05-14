import { createClient, RedisClientType } from "redis";
import { Request, Response, NextFunction } from "express";

export interface LeakyBucketOptions {
  bucketCapacity: number;
  leakRate: number;
  windowInSeconds: number;
  keyPrefix?: string;
}

export interface RateLimiterConfig {
  redisUrl: string;
  serviceName: string;
}

export class RateLimiter {
  private redisClient: RedisClientType;
  private serviceName: string;
  private isConnected: boolean = false;

  constructor(config: RateLimiterConfig) {
    this.serviceName = config.serviceName;

    // ── Prevent Redis from crashing the entire Node process ──
    process.on("uncaughtException", (err) => {
      if (err.message?.includes("Socket closed unexpectedly") ||
          err.message?.includes("ECONNRESET") ||
          err.message?.includes("read ECONNRESET")) {
        console.error(`[${this.serviceName}] Redis socket error caught:`, err.message);
        this.isConnected = false;
        // Don't rethrow — let the app keep running
      }
    });

    this.redisClient = createClient({
      url: config.redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            console.error(`[${this.serviceName}] Redis max retries reached, giving up`);
            return false; // stop retrying, but don't crash
          }
          return Math.min(retries * 1000, 5000);
        },
      },
    }) as RedisClientType;

    // ── Handle all Redis errors gracefully ──
    this.redisClient.on("error", (err) => {
      console.error(`[${this.serviceName}] RateLimiter Redis Error:`, err.message);
      this.isConnected = false;
      // Swallow the error — don't let it propagate
    });

    this.redisClient.on("connect", () => {
      console.log(`[${this.serviceName}] ✅ RateLimiter connected to Redis`);
      this.isConnected = true;
    });

    this.redisClient.on("reconnecting", () => {
      console.log(`[${this.serviceName}] 🔄 RateLimiter reconnecting to Redis...`);
    });

    this.redisClient.on("end", () => {
      console.log(`[${this.serviceName}] Redis connection ended`);
      this.isConnected = false;
    });

    // ── Connect but never crash if it fails ──
    this.redisClient.connect().catch((err) => {
      console.error(`[${this.serviceName}] RateLimiter connect failed:`, err.message);
      this.isConnected = false;
    });
  }

  createLimiter(options: LeakyBucketOptions) {
    const {
      bucketCapacity,
      leakRate,
      windowInSeconds,
      keyPrefix = "leaky",
    } = options;

    return async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> => {

      // Redis down = fail open, never block users
      if (!this.isConnected) {
        next();
        return;
      }

      const ip = req.ip || req.socket.remoteAddress || "unknown";
      const bucketKey    = `${keyPrefix}:${this.serviceName}:${ip}:${req.path}`;
      const timestampKey = `${keyPrefix}_time:${this.serviceName}:${ip}:${req.path}`;

      try {
        const now = Date.now();

        const [currentCount, lastLeakTime] = await Promise.all([
          this.redisClient.get(bucketKey),
          this.redisClient.get(timestampKey),
        ]);

        let count      = parseInt(currentCount || "0");
        const lastLeak = parseInt(lastLeakTime || `${now}`);

        const timePassed    = (now - lastLeak) / 1000;
        const leakPerSecond = leakRate / windowInSeconds;
        const leaked        = Math.floor(timePassed * leakPerSecond);

        count = Math.max(0, count - leaked);

        if (count >= bucketCapacity) {
          const retryAfter = Math.ceil(
            (count - bucketCapacity + 1) / leakPerSecond
          );
          res.setHeader("Retry-After", retryAfter);
          res.setHeader("X-RateLimit-Limit", bucketCapacity);
          res.setHeader("X-RateLimit-Remaining", "0");
          res.setHeader("X-RateLimit-Service", this.serviceName);

          res.status(429).json({
            success: false,
            message: "Too many requests. Please slow down.",
            retryAfter: `${retryAfter} seconds`,
            service: this.serviceName,
          });
          return;
        }

        count += 1;

        await Promise.all([
          this.redisClient.set(bucketKey, count.toString(), { EX: windowInSeconds * 2 }),
          this.redisClient.set(timestampKey, now.toString(), { EX: windowInSeconds * 2 }),
        ]);

        res.setHeader("X-RateLimit-Limit", bucketCapacity);
        res.setHeader("X-RateLimit-Remaining", bucketCapacity - count);
        res.setHeader("X-RateLimit-Service", this.serviceName);

        next();

      } catch (error) {
        console.error(`[${this.serviceName}] Rate limiter error:`, error);
        this.isConnected = false;
        next(); // never block on error
      }
    };
  }

  strictLimiter() {
    return this.createLimiter({ bucketCapacity: 5,   leakRate: 5,   windowInSeconds: 60, keyPrefix: "strict" });
  }
  normalLimiter() {
    return this.createLimiter({ bucketCapacity: 30,  leakRate: 30,  windowInSeconds: 60, keyPrefix: "normal" });
  }
  readLimiter() {
    return this.createLimiter({ bucketCapacity: 100, leakRate: 100, windowInSeconds: 60, keyPrefix: "read"   });
  }
  writeLimiter() {
    return this.createLimiter({ bucketCapacity: 10,  leakRate: 10,  windowInSeconds: 60, keyPrefix: "write"  });
  }

  async disconnect(): Promise<void> {
    await this.redisClient.disconnect();
  }
}