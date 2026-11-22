import mongoose from "mongoose";
const { Schema } = mongoose;
const DocSchema = new Schema({
  kind: { type: String, required: true },
  name: { type: String, default: "" },
  text: { type: String, default: "" },
  imageData: { type: String, select: false },
  hasImage: { type: Boolean, default: false },
  extracted: { type: Schema.Types.Mixed, default: null },
  uploadedAt: { type: Date, default: Date.now }
});
const FlagSchema = new Schema({
  severity: { type: String, enum: ["high", "medium", "low"], default: "medium" },
  field: String,
  finding: String,
  docs: [String],
  resolved: { type: Boolean, default: false },
  officerNote: { type: String, default: "" }
});
const ItemSchema = new Schema({ text: String, done: { type: Boolean, default: false }, note: { type: String, default: "" }, fromAi: { type: Boolean, default: false } });
const HistorySchema = new Schema({
  at: { type: Date, default: Date.now },
  actorId: String,
  actorName: String,
  action: String,
  step: String,
  note: { type: String, default: "" },
  ai: { type: Boolean, default: false },
  meta: Schema.Types.Mixed
}, { _id: true });
const ApplicationSchema = new Schema({
  applicationNo: { type: String, unique: true, index: true },
  mutationType: { type: String, enum: ["sale", "inheritance"], required: true },
  applicant: { name: String, phone: String, relation: String },
  seller: { name: String },
  property: { surveyNo: String, village: String, hobli: String, taluk: String, extent: String },
  transaction: { refNo: String, date: Date },
  receivedAt: { type: Date, default: Date.now },
  dueAt: { type: Date, required: true },
  stepEnteredAt: { type: Date, default: Date.now },
  step: { type: Number, default: 0, min: 0, max: 3 },
  status: { type: String, enum: ["open", "approved", "rejected", "returned"], default: "open", index: true },
  documents: [DocSchema],
  intake: { checks: { identity: Boolean, survey: Boolean, complete: Boolean }, notes: String, doneAt: Date, doneBy: String },
  verification: { reviewed: Boolean, notes: String, doneAt: Date, doneBy: String },
  flags: [FlagSchema],
  consistent: [String],
  inspection: { items: [ItemSchema], visitedAt: Date, location: { lat: Number, lng: Number }, possession: String, objection: { type: Boolean, default: false }, notes: String, doneAt: Date, doneBy: String },
  decision: { outcome: String, reason: String, at: Date, byId: String, byName: String, aiDraftUsed: Boolean, aiDraftEdited: Boolean },
  ai: {
    summary: { text: String, attention: [String], at: Date },
    flagsAt: Date,
    checklistAt: Date,
    reasonDraft: { outcome: String, text: String, at: Date }
  },
  history: [HistorySchema]
}, { timestamps: true });
ApplicationSchema.index({ status: 1, dueAt: 1 });
export default mongoose.models.Application || mongoose.model("Application", ApplicationSchema);
