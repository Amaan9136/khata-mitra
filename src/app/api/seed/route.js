import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Application from "@/models/Application";
import { buildSeed, DEMO_PASSWORD } from "@/lib/seedData";
export async function POST(request) {
  const secret = process.env.SEED_SECRET;
  const given = request.headers.get("x-seed-secret") || "";
  const ok = secret && given.length === secret.length && crypto.timingSafeEqual(Buffer.from(given), Buffer.from(secret));
  if (!ok) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  await dbConnect();
  const { users, applications } = buildSeed();
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  await Promise.all([User.deleteMany({}), Application.deleteMany({})]);
  await User.insertMany(users.map((u) => ({ ...u, passwordHash })));
  await Application.insertMany(applications);
  return NextResponse.json({ ok: true, users: users.length, applications: applications.length });
}
