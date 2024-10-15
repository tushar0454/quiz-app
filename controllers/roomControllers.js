// controllers/roomControllers.js
const Room = require("../models/roomModel");
const { quizzes, broadcastToQuiz } = require("../socket");

// Create a new room
const createRoom = async (req, res) => {
  try {
    const { name } = req.body;

    const newRoom = new Room({
      name,
      createdBy: req.user._id,
    });

    const savedRoom = await newRoom.save();
    res.status(201).json({ message: "Room created", room: savedRoom });
  } catch (error) {
    res.status(500).json({ error: "Failed to create room" });
  }
};

const deleteRoom = async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const room = await Room.findByIdAndDelete(roomId);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("Error deleting room:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// Join a room
// const joinRoom = async (req, res) => {
//   const { roomId } = req.params;
//   const { participant } = req.body; // User who is joining the room

//   try {
//     const room = await Room.findById(roomId).populate("quizzes");
//     if (!room) {
//       return res.status(404).json({ error: "Room not found" });
//     }

//     // Add the participant to the room if not already present
//     const participants = room.participants || [];
//     if (!participants.includes(participant)) {
//       participants.push(participant);
//       room.participants = participants;
//       await room.save();

//       // Broadcast to all clients that a new participant has joined
//       broadcastToQuiz(
//         roomId,
//         JSON.stringify({
//           action: "PARTICIPANT_JOINED",
//           participant: participant,
//           participants: participants,
//         })
//       );
//     }

//     // Send the current list of participants to the joining user
//     res.json({ room, participants });
//   } catch (error) {
//     console.error("Error joining room:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

const joinRoom = async (req, res) => {
  const { roomId } = req.params;
  const { participant } = req.body;

  try {
    const room = await Room.findById(roomId).populate("quizzes");
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    if (!room.participants.includes(participant)) {
      room.participants.push(participant);
      await room.save();

      // Notify all WebSocket clients in this room
      broadcastToQuiz(
        roomId,
        JSON.stringify({
          action: "PARTICIPANT_JOINED",
          participant: participant,
          participants: room.participants,
        })
      );
    }

    res.json({ room, participants: room.participants });
  } catch (error) {
    console.error("Error joining room:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const removeUserFromRoom = async (req, res) => {
  const { roomId } = req.params;
  const userId = req.user._id;

  try {
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Check if user is part of the room
    if (!room.participants.includes(userId)) {
      return res.status(400).json({ message: "User is not part of the room" });
    }

    // Remove the user from the participants list
    room.participants = room.participants.filter(
      (participant) => participant.toString() !== userId.toString()
    );

    // Save the updated room
    await room.save();

    // Notify all participants via WebSocket that the user has left
    broadcastToQuiz(
      roomId,
      JSON.stringify({
        action: "PARTICIPANT_LEFT",
        participant: userId,
        participants: room.participants, // Send updated participants list
      })
    );

    // Return the updated list of participants
    res.status(200).json({
      message: "User removed from room",
      participants: room.participants,
    });
  } catch (error) {
    console.error("Error removing user from room:", error);
    res.status(500).json({ error: "Failed to remove user from room" });
  }
};

const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate("quizzes")
      .populate("createdBy", "name email");
    res.status(200).json({ rooms });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
};

const getRoomById = async (req, res) => {
  try {
    console.log("Params: ", req.params);

    const roomId = req.params.id;
    const room = await Room.findById(roomId).populate("quizzes");

    console.log("Room", room);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json(room);
  } catch (error) {
    console.error("Error fetching room:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createRoom,
  getAllRooms,
  joinRoom,
  getRoomById,
  deleteRoom,
  removeUserFromRoom,
};
