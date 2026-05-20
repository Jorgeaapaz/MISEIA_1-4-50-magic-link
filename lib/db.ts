import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/magiklink";

const globalForMongo = globalThis as unknown as {
  _mongoClientPromise?: Promise<MongoClient>;
};

if (!globalForMongo._mongoClientPromise) {
  const client = new MongoClient(uri);
  globalForMongo._mongoClientPromise = client.connect();
}

const clientPromise = globalForMongo._mongoClientPromise!;

let indexesCreated = false;

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  const db = client.db();

  if (!indexesCreated) {
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    indexesCreated = true;
  }

  return db;
}
