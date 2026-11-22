import dns from "node:dns";
import mongoose from "mongoose";
const MONGODB_URI = process.env.MONGODB_URI;
const OPTIONS = { bufferCommands: false, autoIndex: process.env.NODE_ENV !== "production", family: 4, maxPoolSize: 10, serverSelectionTimeoutMS: 8000 };
const useResolvers = () => dns.setServers((process.env.MONGODB_DNS_SERVERS || "8.8.8.8,1.1.1.1").split(",").map((s) => s.trim()).filter(Boolean));
let cached = global._mongooseCache;
if (!cached) cached = global._mongooseCache = { conn: null, promise: null };
async function connect() {
  if (process.env.MONGODB_DNS_SERVERS) useResolvers();
  try {
    return await mongoose.connect(MONGODB_URI, OPTIONS);
  } catch (err) {
    if (!MONGODB_URI.startsWith("mongodb+srv") || !/querySrv|querytxt/i.test(`${err?.syscall} ${err?.message}`)) throw err;
    useResolvers();
    return mongoose.connect(MONGODB_URI, OPTIONS);
  }
}
export async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!MONGODB_URI) throw new Error("MONGODB_URI is not set");
  if (!cached.promise) cached.promise = connect().catch((err) => {
    cached.promise = null;
    throw err;
  });
  cached.conn = await cached.promise;
  return cached.conn;
}
export default dbConnect;
