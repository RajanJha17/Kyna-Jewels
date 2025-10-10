const { MongoClient } = require("mongodb");

async function dropOrderNumberIndex() {
  let client;

  try {
    // Connect to MongoDB
    client = new MongoClient("mongodb://localhost:27017");
    await client.connect();

    const db = client.db("authdb");
    const collection = db.collection("orders");

    // List current indexes
    const indexes = await collection.indexes();
    console.log("Current indexes:");
    indexes.forEach((index) => {
      console.log("- ", index.name, ":", JSON.stringify(index.key));
    });

    // Try to drop the orderNumber index
    try {
      await collection.dropIndex("orderNumber_1");
      console.log("\n✅ Successfully dropped orderNumber_1 index");
    } catch (error) {
      if (error.message.includes("index not found")) {
        console.log(
          "\n⚠️  orderNumber_1 index not found (already dropped or doesn't exist)"
        );
      } else {
        console.log("\n❌ Error dropping index:", error.message);
      }
    }

    // List indexes after dropping
    const updatedIndexes = await collection.indexes();
    console.log("\nUpdated indexes:");
    updatedIndexes.forEach((index) => {
      console.log("- ", index.name, ":", JSON.stringify(index.key));
    });
  } catch (error) {
    console.error("Connection error:", error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

dropOrderNumberIndex();
