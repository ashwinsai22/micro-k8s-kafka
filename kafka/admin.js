import { Kafka } from "kafkajs";

process.env.KAFKAJS_NO_PARTITIONER_WARNING = "1";

const kafka = new Kafka({
  clientId: "kafka-service",
  brokers: process.env.KAFKA_BROKERS
    ? process.env.KAFKA_BROKERS.split(",")
    : [
        "kafka-0.kafka.microkafka.svc.cluster.local:9092",
        "kafka-1.kafka.microkafka.svc.cluster.local:9092",
        "kafka-2.kafka.microkafka.svc.cluster.local:9092",
      ],
});

const admin = kafka.admin();

const run = async () => {
  try {
    await admin.connect();
    console.log("Kafka admin connected");

    await admin.createTopics({
      topics: [
        { topic: "payment-successful", numPartitions: 1, replicationFactor: 3 },
        { topic: "order-successful", numPartitions: 1, replicationFactor: 3 },
        { topic: "email-successful", numPartitions: 1, replicationFactor: 3 },
      ],
    });

    console.log("Kafka topics ensured");
  } catch (err) {
    console.error("Kafka admin error", err);
  } finally {
    await admin.disconnect();
    process.exit(0);
  }
};

run();
