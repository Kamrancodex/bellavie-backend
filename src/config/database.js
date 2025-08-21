const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI ||
      "mongodb+srv://kampremiumyt:CfBF6Rsm3FLwwQxy@cluster0.moaux.mongodb.net/bellavie-crm?retryWrites=true&w=majority&appName=Cluster0";

    // If using MongoDB Atlas, ensure we specify the database name
    const finalMongoURI = mongoURI.includes("mongodb+srv://")
      ? mongoURI.replace("/?", "/bellavie-crm?")
      : mongoURI;

    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: true, // Enable mongoose buffering to queue commands until connected
    };

    const conn = await mongoose.connect(finalMongoURI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);

    // Connection event listeners
    mongoose.connection.on("connected", () => {
      console.log("📡 Mongoose connected to MongoDB");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ Mongoose connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("📴 Mongoose disconnected from MongoDB");
    });

    // If the Node process ends, close the Mongoose connection
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("🔒 Mongoose connection closed through app termination");
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Database connection error:", error.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log("🔒 Database connection closed successfully");
  } catch (error) {
    console.error("❌ Error closing database connection:", error.message);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
};
