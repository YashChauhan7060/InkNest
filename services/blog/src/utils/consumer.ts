import amqp from "amqplib";
import { redisClient } from "../server.js";
import { sql } from "./db.js";

process.on("uncaughtException", (err: any) => {
  if (err.code === "ECONNRESET") {
    console.error("⚠️ Caught ECONNRESET - will reconnect:", err.message);
    return;
  }
  console.error("💥 Uncaught Exception:", err);
  process.exit(1);
});

interface CacheInvalidationMessage {
  action: string;
  keys: string[];
}

let restartTimeout: ReturnType<typeof setTimeout> | null = null;

const scheduleConsumerRestart = (delay = 5000) => {
  if (restartTimeout) return;
  restartTimeout = setTimeout(async () => {
    restartTimeout = null;
    console.log("🔄 Restarting cache consumer...");
    await startCacheConsumer();
  }, delay);
};

const getConnectOptions = () =>
  process.env.RABBITMQ_URL || {
    protocol: "amqp",
    hostname: process.env.Rabbitmq_Host,
    port: process.env.Rabbitmq_Port ? parseInt(process.env.Rabbitmq_Port) : 5672,
    username: process.env.Rabbitmq_Username,
    password: process.env.Rabbitmq_Password,
  };

export const startCacheConsumer = async (): Promise<void> => {
  try {
    const connection = await amqp.connect(getConnectOptions() as any);

    connection.on("error", (err) => {
      console.error("❌ RabbitMQ consumer error:", err.message);
      scheduleConsumerRestart();
    });

    connection.on("close", () => {
      console.warn("⚠️ RabbitMQ consumer connection closed. Restarting...");
      scheduleConsumerRestart();
    });

    const channel = await connection.createChannel();
    const queueName = "cache-invalidation";
    await channel.assertQueue(queueName, { durable: true });
    console.log("✅ Blog Service cache consumer started");

    channel.consume(queueName, async (msg) => {
      if (!msg) return;
      try {
        const content = JSON.parse(msg.content.toString()) as CacheInvalidationMessage;
        console.log("📩 Blog service received cache invalidation message", content);

        if (content.action === "invalidateCache") {
          for (const pattern of content.keys) {
            const keys = await redisClient.keys(pattern);
            if (keys.length > 0) {
              await redisClient.del(keys);
              console.log(`🗑️ Invalidated ${keys.length} keys matching: ${pattern}`);
              const cacheKey = `blogs::`;
              const blogs = await sql`SELECT * FROM blogs ORDER BY create_at DESC`;
              await redisClient.set(cacheKey, JSON.stringify(blogs), { EX: 3600 });
              console.log("🔄 Cache rebuilt:", cacheKey);
            }
          }
        }
        channel.ack(msg);
      } catch (error) {
        console.error("❌ Error processing message:", error);
        channel.nack(msg, false, true);
      }
    });
  } catch (error) {
    console.error("❌ Failed to start RabbitMQ consumer:", error);
    scheduleConsumerRestart();
  }
};