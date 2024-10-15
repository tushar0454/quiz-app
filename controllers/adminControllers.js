const QuizModel = require("../models/quizModel");
const Room = require("../models/roomModel");

const createQuiz = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { title, questions, timeLimit } = req.body;

    console.log("Creating quiz with details:", {
      roomId,
      title,
      questions,
      timeLimit,
    });

    // Check if the room exists
    const room = await Room.findById(roomId);
    if (!room) {
      console.error(`Room with ID ${roomId} not found.`);
      return res.status(404).json({ error: "Room not found" });
    }
    console.log(`Found room: ${room}`);

    const newQuiz = new QuizModel({
      title,
      questions,
      timeLimit,
      createdBy: req.user._id,
    });

    console.log("New quiz object created:", newQuiz);

    const savedQuiz = await newQuiz.save();
    console.log("Quiz saved successfully:", savedQuiz);

    // Add quiz reference to the room
    room.quizzes.push(savedQuiz._id);
    await room.save();
    console.log(`Quiz ${savedQuiz._id} added to room ${roomId}.`);

    res
      .status(201)
      .json({ message: "Quiz created and added to room", quiz: savedQuiz });
  } catch (error) {
    console.error("Error creating quiz:", error);
    res
      .status(500)
      .json({ error: "Failed to create quiz", details: error.message });
  }
};

// Update a quiz
const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedQuiz = await QuizModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).json({ message: "Quiz updated", quiz: updatedQuiz });
  } catch (error) {
    res.status(500).json({ error: "Failed to update quiz" });
  }
};

// Delete a quiz
const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    await QuizModel.findByIdAndDelete(id);
    res.status(200).json({ message: "Quiz deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete quiz" });
  }
};

// Fetch all quizzes
const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await QuizModel.find().populate("createdBy", "name email");
    res.status(200).json({ quizzes });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch quizzes" });
  }
};

module.exports = {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getAllQuizzes,
};
