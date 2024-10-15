const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../helpers/authMiddleware");
const {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getAllQuizzes,
} = require("../controllers/adminControllers");

// Quiz routes (create a quiz inside a specific room)
router.post("/room/:roomId/quiz", requireAdmin, createQuiz);
router.put("/quiz/:id", requireAdmin, updateQuiz);
router.delete("/quiz/:id", requireAdmin, deleteQuiz);
router.get("/quizzes", getAllQuizzes);

module.exports = router;
