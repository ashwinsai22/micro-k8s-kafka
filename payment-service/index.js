import express from "express";
import cors from "cors";
import { Kafka } from "kafkajs";

const app = express();

app.use(
  cors({
    origin: "https://microkafka.bezawada.link",
  })
);
app.use(express.json());

const kafka = new Kafka({
  clientId: "payment-service",
  brokers: process.env.KAFKA_BROKERS
    ? process.env.KAFKA_BROKERS.split(",")
    : ["kafka-0.kafka.microkafka.svc.cluster.local:9092"],
});

const producer = kafka.producer();

const connectToKafka = async () => {
  try {
    await producer.connect();
    console.log("Producer connected!");
  } catch (err) {
    console.error("Error connecting to Kafka", err);
  }
};

/**
 * ✅ IMPORTANT FIX
 * Ingress forwards /payment-service → /
 */
app.post("/", async (req, res, next) => {
  try {
    const { cart } = req.body;
    const userId = "123";

    await producer.send({
      topic: "payment-successful",
      messages: [{ value: JSON.stringify({ userId, cart }) }],
    });

    return res.status(200).json({
      success: true,
      message: "Payment successful",
    });
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

app.listen(8000, () => {
  connectToKafka();
  console.log("Payment service is running on port 8000");
});
