const {
  createRoom,
  getAllRooms,
  getRoomById,
  joinRoom,
  removeUserFromRoom,
  deleteRoom,
} = require("../controllers/roomControllers");

const express = require("express");
const { requireAdmin } = require("../helpers/authMiddleware");
const { createQuiz, deleteUser } = require("../controllers/adminControllers");
const router = express.Router();

// Room routes
router.post("/", requireAdmin, createRoom);
router.delete("/:roomId", requireAdmin, deleteRoom);
router.get("/quiz-rooms", getAllRooms);
router.post("/:roomId/join", joinRoom);
router.get("/room/:id", getRoomById);

// Quiz routes (create a quiz inside a specific room)
router.post("/:roomId/quiz", requireAdmin, createQuiz);

//Delete user from a room
router.patch("/:roomId/:userId", removeUserFromRoom);
module.exports = router;
