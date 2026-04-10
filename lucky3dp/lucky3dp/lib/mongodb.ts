import { MongoClient, Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI!;

let cached: { client: MongoClient; db: Db } | null = null;

export async function connectDB(): Promise<{ client: MongoClient; db: Db }> {
  if (cached) return cached;

  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db("lucky3dp");
  cached = { client, db };
  return cached;
}
