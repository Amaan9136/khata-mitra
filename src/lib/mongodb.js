import mongoose from "mongoose";
const MONGODB_URI = process.env.MONGODB_URI;
let cached = global._mongooseCache;
if (!cached) cached = global._mongooseCache = { conn: null, promise: null };
export async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!MONGODB_URI) throw new Error("MONGODB_URI is not set");
  if (!cached.promise) cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false, autoIndex: process.env.NODE_ENV !== "production", family: 4, maxPoolSize: 10, serverSelectionTimeoutMS: 8000 }).catch((err) => {
    cached.promise = null;
    throw err;
  });
  cached.conn = await cached.promise;
  return cached.conn;
}
export default dbConnect;
