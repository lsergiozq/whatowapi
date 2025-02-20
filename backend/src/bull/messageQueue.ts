import Queue from "bull";

const messageQueue = new Queue(`messageQueue${process.env.API_ID}`, {
  redis: {
    host: process.env.REDIS_HOST || "192.168.0.3",
    port: parseInt(process.env.REDIS_PORT) || 6379,
  },
});

messageQueue.on("ready", () => {
  console.log("Queue is ready!");
});

messageQueue.on("error", (error) => {
  console.error("Queue error:", error);
});

messageQueue.on("active", (job) => {
  console.log(`Job ${job.id} is now active`);
});

messageQueue.on("completed", (job) => {
  console.log(`Job ${job.id} has been completed`);
});

messageQueue.on("failed", (job, error) => {
  console.error(`Job ${job.id} has failed:`, error);
});

export default messageQueue;
