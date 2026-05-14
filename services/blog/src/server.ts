import express from 'express';
import dotenv from 'dotenv';
import blogRoutes from './routes/blog.js';
import { createClient } from 'redis'; 
import { startCacheConsumer } from './utils/consumer.js';
import cors from 'cors';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://sangam-samvad.vercel.app"
  ],
  credentials: true,
}));

const port = process.env.PORT;

export const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
    rejectUnauthorized: false,
    reconnectStrategy: (retries) => {
      if (retries > 5) return false;
      return Math.min(retries * 1000, 5000);
    },
  },
});

redisClient.on("error", (err) => console.error("❌ Redis error:", err.message));
redisClient.on("connect", () => console.log("✅ Redis connected"));
redisClient.on("ready", () => console.log("✅ Redis ready"));
redisClient.on("reconnecting", () => console.log("🔄 Redis reconnecting..."));

redisClient
  .connect()
  .then(() => {
    console.log("✅ Connected to Redis");
    startCacheConsumer();
  })
  .catch((err) => {
    console.error("❌ Redis connection failed:", err.message);
  });


app.use("/api/v1", blogRoutes);


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});