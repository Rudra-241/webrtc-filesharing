// const WebSocket = require("ws");
// const { jwtDecode, JwtPayload } = require("jwt-decode");

// const wss = new WebSocket.Server({ port: 8080 });
// let peers = {}; // Store connected peers with their WebSocket connections

// wss.on("connection", (ws) => {
//   ws.on("message", (message) => {
//     try {
//       const data = JSON.parse(message);

//       switch (data.type) {
//         case "join":
//           // TODO: add JWT verify()
//           const username = jwtDecode(JSON.stringify(data.id)).username;
//           peers[username] = ws;

//           console.log(`Peer ${username} joined`);
//           break;

//         case "offer":
//         case "answer":
//         case "candidate":
//           // Send offer/answer/candidate to the target peer if they exist
//           sendToPeer(data.to, JSON.stringify(data));
//           break;

//         default:
//           console.error("Unknown message type:", data.type);
//       }
//     } catch (error) {
//       console.error("Error parsing message:", error);
//     }
//   });

//   ws.on("close", () => {
//     // Remove the peer from the list when they disconnect
//     for (const id in peers) {
//       if (peers[id] === ws) {
//         console.log(`Peer ${id} disconnected`);
//         delete peers[id];
//         break;
//       }
//     }
//   });
// });

// function sendToPeer(peerId, message) {
//   const peerConnection = peers[peerId];
//   if (peerConnection) {
//     peerConnection.send(message);
//   } else {
//     console.warn(`Peer ${peerId} not found`);
//   }
// }

// console.log("WebSocket server started on ws://localhost:8080");


const WebSocket = require("ws");
const jwt = require("jsonwebtoken");

const wss = new WebSocket.Server({ port: 8080 });
let peers = {}; // Store connected peers with their WebSocket connections

// Replace with your actual secret key
const JWT_SECRET_KEY = "FileTransfer123@CN";

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case "join":
          // Verify and decode the JWT token to get the username
          const decodedToken = jwt.verify(data.id, JWT_SECRET_KEY);
          const username = decodedToken.username;

          // Store the WebSocket connection under the username
          peers[username] = ws;
          console.log(`Peer ${username} joined`);
          break;

        case "offer":
        case "answer":
        case "candidate":
          // Send offer/answer/candidate to the target peer if they exist
          sendToPeer(data.to, JSON.stringify(data));
          break;

        default:
          console.error("Unknown message type:", data.type);
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  });

  ws.on("close", () => {
    // Remove the peer from the list when they disconnect
    for (const id in peers) {
      if (peers[id] === ws) {
        console.log(`Peer ${id} disconnected`);
        delete peers[id];
        break;
      }
    }
  });
});

function sendToPeer(peerId, message) {
  const peerConnection = peers[peerId];
  if (peerConnection) {
    peerConnection.send(message);
  } else {
    console.warn(`Peer ${peerId} not found`);
  }
}

console.log("WebSocket server started on ws://localhost:8080");
