import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    console.log("Already connected to database");
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI || "", {});
    console.log(db);
    // in db we get connections array, and the first item is our current connection. We check if it is ready
    // if it is ready, we set isConnected to the readyState of the connection
    connection.isConnected = db.connections[0].readyState;

    console.log("Connected to database successfully");
  } catch (error) {
    console.log("Error connecting to database: ", error);
    process.exit(1);
  }
}
export default dbConnect;
