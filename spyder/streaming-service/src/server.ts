import net from "net";
import { WebSocket, WebSocketServer } from "ws";

interface VehicleData {
  battery_temperature: number | string;
  timestamp: number;
}

const TCP_PORT = 12000;
const WS_PORT = 8080;
const tcpServer = net.createServer();
const websocketServer = new WebSocketServer({ port: WS_PORT });

let outOfRangeEvents: number[] = [];
const SAFE_MIN = 20;
const SAFE_MAX = 80;
const WINDOW_MS = 5000; // 5 seconds
const MAX_EVENTS = 3;

tcpServer.on("connection", (socket) => {
  console.log("TCP client connected");

  socket.on("data", (msg) => {
    const message: string = msg.toString();
    console.log(`Received: ${message}`);

    let parsed: VehicleData | null = null;

    try {
      parsed = JSON.parse(message) as VehicleData;
    } catch (err) {
      console.warn("Invalid JSON received, ignoring:", message);
      return; // drop bad JSON
    }

    // Validate the fields
    const isValid =
      typeof parsed.battery_temperature === "number" &&
      !isNaN(parsed.battery_temperature) &&
      typeof parsed.timestamp === "number" &&
      !isNaN(parsed.timestamp);

    if (!isValid) {
      console.warn("Invalid data format received, ignoring:", parsed);
      return; // drop or handle differently
    }

    const temp = Number(parsed.battery_temperature);
    const now = Date.now();

    if (temp < SAFE_MIN || temp > SAFE_MAX) {
      outOfRangeEvents.push(now);

      // Keep only events in last 5 seconds
      outOfRangeEvents = outOfRangeEvents.filter(
        (t) => now - t <= WINDOW_MS
      );

      // If more than 3 events → log warning
      if (outOfRangeEvents.length > MAX_EVENTS) {
        console.error(
          `[${new Date().toISOString()}] ERROR: Battery temperature out of safe range more than ${MAX_EVENTS} times in last 5s`
        );
        // Optionally reset array to avoid spamming
        outOfRangeEvents = [];
      }
    }

    // If valid, forward to WebSocket clients
    websocketServer.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(parsed));
      }
    });
  });

  socket.on("end", () => {
    console.log("Closing connection with the TCP client");
  });

  socket.on("error", (err) => {
    console.log("TCP client error: ", err);
  });
});

websocketServer.on("listening", () =>
  console.log(`Websocket server started on port ${WS_PORT}`)
);

websocketServer.on("connection", async (ws: WebSocket) => {
  console.log("Frontend websocket client connected");
  ws.on("error", console.error);
});

tcpServer.listen(TCP_PORT, () => {
  console.log(`TCP server listening on port ${TCP_PORT}`);
});
