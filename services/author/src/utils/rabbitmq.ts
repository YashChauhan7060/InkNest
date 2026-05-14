import amqp from "amqplib";

process.on("uncaughtException", (err: any) => {
  if (err.code === "ECONNRESET") {
    console.error("⚠️ Caught ECONNRESET - will reconnect:", err.message);
    return;
  }
  console.error("💥 Uncaught Exception:", err);
  process.exit(1);
});

let channel: amqp.Channel | null = null;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

const getConnectOptions = () =>
  process.env.RABBITMQ_URL || {
    protocol: "amqp",
    hostname: process.env.Rabbitmq_Host,
    port: process.env.Rabbitmq_Port ? parseInt(process.env.Rabbitmq_Port) : 5672,
    username: process.env.Rabbitmq_Username,
    password: process.env.Rabbitmq_Password,
  };

const scheduleReconnect = (delay = 5000) => {
  if (reconnectTimeout) return;
  reconnectTimeout = setTimeout(async () => {
    reconnectTimeout = null;
    console.log("🔄 Attempting RabbitMQ reconnection...");
    await connectRabbitMQ();
  }, delay);
};

export const connectRabbitMQ = async (): Promise<void> => {
  try {
    const connection = await amqp.connect(getConnectOptions() as any);

    connection.on("error", (err) => {
      console.error("❌ RabbitMQ connection error:", err.message);
      channel = null;
      scheduleReconnect();
    });

    connection.on("close", () => {
      console.warn("⚠️ RabbitMQ connection closed. Reconnecting...");
      channel = null;
      scheduleReconnect();
    });

    channel = await connection.createChannel();
    console.log("✅ Connected to RabbitMQ");
  } catch (error) {
    console.error("❌ Failed to connect to RabbitMQ:", error);
    scheduleReconnect();
  }
};

export const publishToQueue = async (queueName: string, message: any): Promise<void> => {
  if (!channel) {
    console.error("❌ RabbitMQ channel not initialized. Message dropped.");
    return;
  }
  await channel.assertQueue(queueName, { durable: true });
  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), { persistent: true });
};

export const invalidateChacheJob = async (cacheKeys: string[]): Promise<void> => {
  try {
    await publishToQueue("cache-invalidation", {
      action: "invalidateCache",
      keys: cacheKeys,
    });
    console.log("✅ Cache invalidation job published to RabbitMQ");
  } catch (error) {
    console.error("❌ Failed to publish cache invalidation:", error);
  }
};