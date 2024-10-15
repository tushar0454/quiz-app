const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
