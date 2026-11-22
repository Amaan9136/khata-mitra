import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Application from "@/models/Application";
import { requireOfficer, fail } from "@/lib/requireOfficer";
export async function GET(_req, { params }) {
  const { errorResponse } = await requireOfficer();
  if (errorResponse) return errorResponse;
  const { id, docId } = await params;
  if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(docId)) return fail("not_found", 404);
  const app = await Application.findById(id).select("+documents.imageData");
  const doc = app?.documents.id(docId);
  if (!doc) return fail("not_found", 404);
  return NextResponse.json({ imageData: doc.imageData || "", text: doc.text || "" });
}
