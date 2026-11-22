import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/mongodb";
import Application from "@/models/Application";
import mongoose from "mongoose";
export async function requireOfficer() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { errorResponse: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  await dbConnect();
  return { user: session.user };
}
export async function loadApplication(id, select = "") {
  if (!mongoose.isValidObjectId(id)) return null;
  return Application.findById(id).select(select);
}
export const fail = (error, status = 400, extra = {}) => NextResponse.json({ error, ...extra }, { status });
export const logEntry = (user, action, step, note = "", ai = false, meta = undefined) => ({ at: new Date(), actorId: user.id, actorName: user.name, action, step, note, ai, ...(meta ? { meta } : {}) });
export const view = (doc) => {
  const o = doc.toObject({ flattenMaps: true });
  o.id = String(o._id);
  delete o._id;
  delete o.__v;
  o.documents = (o.documents || []).map(({ imageData, ...d }) => ({ ...d, id: String(d._id), _id: undefined }));
  o.flags = (o.flags || []).map((f) => ({ ...f, id: String(f._id), _id: undefined }));
  o.inspection = o.inspection ? { ...o.inspection, items: (o.inspection.items || []).map((i) => ({ ...i, id: String(i._id), _id: undefined })) } : o.inspection;
  o.history = (o.history || []).map((h) => ({ ...h, id: String(h._id), _id: undefined }));
  return o;
};
