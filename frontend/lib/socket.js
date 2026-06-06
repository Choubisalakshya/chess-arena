"use client";

import { io } from "socket.io-client";

// Connect to backend server (make sure backend is running on port 4000)
export const socket = io("http://localhost:4000", {
  transports: ["websocket"], // ensure WebSocket transport
  autoConnect: false,        // connect manually when needed
});
