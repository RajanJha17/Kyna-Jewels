const mongoose = require("mongoose");

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/authdb")
  .then(async () => {
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    const ordersCollection = db.collection("orders");

    try {
      // First, let's see what we have
      const countAll = await ordersCollection.countDocuments();
      const countNullOrderNumber = await ordersCollection.countDocuments({
        orderNumber: null,
      });
      const countUndefinedOrderNumber = await ordersCollection.countDocuments({
        orderNumber: { $exists: false },
      });

      console.log(`Total orders: ${countAll}`);
      console.log(`Orders with orderNumber: null: ${countNullOrderNumber}`);
      console.log(
        `Orders without orderNumber field: ${countUndefinedOrderNumber}`
      );

      // Delete orders with null or undefined orderNumber to resolve conflicts
      if (countNullOrderNumber > 0) {
        const deleteResult = await ordersCollection.deleteMany({
          orderNumber: null,
        });
        console.log(
          `Deleted ${deleteResult.deletedCount} orders with null orderNumber`
        );
      }

      if (countUndefinedOrderNumber > 0) {
        const deleteResult = await ordersCollection.deleteMany({
          orderNumber: { $exists: false },
        });
        console.log(
          `Deleted ${deleteResult.deletedCount} orders without orderNumber field`
        );
      }

      // Try to drop the unique index if it exists
      try {
        const indexInfo = await ordersCollection.indexInformation();
        console.log("Current indexes:", Object.keys(indexInfo));

        if (indexInfo.orderNumber_1) {
          await ordersCollection.dropIndex("orderNumber_1");
          console.log("✅ Dropped orderNumber_1 unique index");
        } else {
          console.log("ℹ️  No orderNumber_1 index found");
        }
      } catch (indexError) {
        console.log("Index operation result:", indexError.message);
      }

      console.log("✅ Cleanup completed");
    } catch (error) {
      console.error("❌ Error during cleanup:", error);
    }

    mongoose.disconnect();
  })
  .catch((error) => {
    console.error("Connection error:", error);
  });
