const WebSocketServer = require("websocket").server;

let connections = [];
let quizzes = {}; // To store quiz data and participants

const setupWebSocket = (server) => {
  const websocket = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false,
  });

  websocket.on("request", (request) => {
    try {
      const connection = request.accept(null, request.origin);
      connections.push(connection);

      connection.on("message", (message) => {
        try {
          const parsedMessage = JSON.parse(message.utf8Data);
          handleSocketMessage(parsedMessage, connection);
        } catch (error) {
          console.error("Error parsing message:", error);
          connection.send(JSON.stringify({ error: "Invalid message format" }));
        }
      });

      connection.on("close", () => {
        connections = connections.filter((conn) => conn !== connection);
        console.log("Connection closed");
      });

      connection.on("error", (error) => {
        console.error("WebSocket error:", error);
      });
    } catch (error) {
      console.error("Error accepting WebSocket connection:", error);
    }
  });
};

// Handle incoming WebSocket messages
const handleSocketMessage = (message, connection) => {
  console.log("Received message:", message);
  const { action, payload } = message;

  switch (action) {
    case "CREATE_QUIZ":
      createQuiz(payload.quizId, payload.host, connection);
      break;

    case "JOIN_QUIZ":
      joinQuiz(payload.quizId, payload.participant, connection);
      break;

    default:
      connection.send(JSON.stringify({ error: "Invalid action" }));
  }
};

// Create a new quiz
const createQuiz = (quizId, host, connection) => {
  if (!quizzes[quizId]) {
    quizzes[quizId] = {
      host,
      participants: [],
      questions: [],
      currentQuestion: 0,
      hostConnection: connection,
    };
    connection.send(JSON.stringify({ message: "Quiz created", quizId }));
  } else {
    connection.send(JSON.stringify({ error: "Quiz already exists" }));
  }
};

// Join an existing quiz
const joinQuiz = (quizId, participant, connection) => {
  console.log("fevf", quizzes);
  if (!quizzes[quizId]) {
    quizzes[quizId] = [];
  }

  // Add the participant to the quiz
  quizzes[quizId].push({ participant, connection });

  console.log("After", quizzes);

  // Notify all participants that a new user has joined
  broadcastToQuiz(
    quizId,
    JSON.stringify({
      action: "PARTICIPANT_JOINED",
      participant: participant,
      participants: quizzes[quizId].map((p) => p.participant),
    })
  );
};

// Broadcast message to all participants in the quiz
const broadcastToQuiz = (quizId, message) => {
  const quiz = quizzes[quizId];
  if (quiz) {
    quiz.forEach((participant) => {
      participant.connection.send(message);
    });
  }
};

module.exports = { setupWebSocket, quizzes, broadcastToQuiz };
