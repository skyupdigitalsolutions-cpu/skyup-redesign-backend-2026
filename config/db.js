const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 20000,
  retryWrites: true,
  retryReads: true,
  maxPoolSize: 10,
  minPoolSize: 0,
});

let db;
let connectPromise = null;

function connectToDatabase() {
  if (db) return Promise.resolve(db);
  if (connectPromise) return connectPromise;

  connectPromise = (async () => {
    console.log("🔄 Connecting to MongoDB...");
    await client.connect();
    db = client.db("skyup");
    console.log("✅ MongoDB connected, database 'skyup' ready");
    return db;
  })().catch((error) => {
    connectPromise = null;
    console.error("❌ MongoDB connection failed:", error.message);
    throw error;
  });

  return connectPromise;
}

function getDb() {
  if (!db) throw new Error("Database not initialized. Call connectToDatabase() first.");
  return db;
}

process.on("SIGINT", async () => {
  try {
    await client.close();
    console.log("\n✅ MongoDB connection closed");
  } finally {
    process.exit(0);
  }
});

module.exports = { connectToDatabase, getDb };
