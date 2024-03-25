const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);

// const { Server } = require("socket.io");
// const io = new Server(server, {
// 	cors: {
// 		origin: "http://localhost:3000",
// 	},
// });

const io = require("socket.io")(server, {
	cors: {
		origin: "http://localhost:3000",
		methods: ["GET", "POST"],
		allowedHeaders: ["my-custom-header"],
		credentials: true,
	},
});
// io.listen(8000);

const connectDB = require("./config/db");
const cors = require("cors");

connectDB();

// Init Middleware
app.use(express.json({ extended: false }));

app.get("/", (req, res) => res.send("API running"));

app.use(cors());
app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept"
	);
	next();
});

app.get("/", (req, res) => {
	res.send("server");
});

const rooms = {};

const getAllUsers = (room) => {
	const adapter = io.sockets.adapter; // Get the adapter for the default namespace

    // Check if adapter and rooms are available
    if (adapter && adapter.rooms) {
        // Get the IDs of all sockets in the room
        const roomSockets = adapter.rooms.get(room);
        if (roomSockets) {
            return Array.from(roomSockets); // Convert Set to Array
        } else {
            return [];
        }
    } else {
        return [];
    }
}

let canvasElementsGlobal, roomIdGlobal;
io.on("connection", (socket) => {
	console.log("User Connected");
	socket.emit("me", socket.id)
	socket.on("userJoined", async (data) => {
		console.log("User has joined a room");
		const { roomId, userId, userName, host, presenter } = data;
		roomIdGlobal = roomId;
		// console.log("ROOM ID:" + roomIdGlobal);
		console.log("sending users in room..")
		socket.emit("roomUsers", (getAllUsers(roomId)))
		socket.join(roomIdGlobal);
		console.log("All sockets now in room " + roomId + ": " + getAllUsers(roomId))
		//console.log(roomIdGlobal);
		// const socketsInRoom = await io.in(roomIdGlobal).fetchSockets();
		// const room = socket.adapter.rooms[roomIdGlobal];
		// if (room) {
		// 	console.log(`Socket ${socket.id} has joined room ${roomIdGlobal}`);
		// 	console.log(`Number of sockets in room ${roomIdGlobal}: ${room.length}`);
		// } else {
		// 	console.log(`Failed to join room ${roomIdGlobal}`);
		// }
		console.log("Room onboarding complete");
		// if (!rooms[roomId]) {
		// 	rooms[roomId] = { users: new Set() };
		// 	console.log(`Room ${roomId} created`);
		// }
		// rooms[roomId].users.add(socket.id);
		// console.log(`User ${socket.id} added to room ${roomId}`);
	});

	socket.on("callUser", (data) => {
		console.log(`Forwarding call message from user ${data.from} to ${data.to}`)
		io.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from })
	})

	socket.on("answerCall", (data) => {
		console.log(`Forwarding answer message from user ${data.from} to ${data.to}`)
		io.to(data.to).emit("callAccepted", data.signal)
	})

	socket.on("elements", (data) => {
		console.log("received drawing");
		// canvasElementsGlobal = data;
		// console.log(canvasElementsGlobal);
		console.log(roomIdGlobal);
		console.log(data);
		socket.to(roomIdGlobal).emit("servedElements", data);
		// socket.broadcast.emit("servedElements", data);
		console.log("drawing sent to room");
	});
});

// socket.io
// let canvasElementsGlobal, roomIdGlobal;
// io.on("connection", (socket) => {
// 	console.log("Connected socket");
// 	socket.on("user_joined", (data) => {
// 		const { roomId, userId, userName, host, presenter } = data;
// 		console.log("A user has joined the room" + userId);
// 		roomIdGlobal = roomId;
// 		console.log("ROOM ID:" + roomIdGlobal);
// 		socket.join(roomIdGlobal);
// 		socket.emit("userHasJoined", { success: true });
// 		socket.broadcast.to(roomIdGlobal).emit("drawing", canvasElementsGlobal);
// 	});

// 	socket.on("drawing", (data) => {
// 		canvasElementsGlobal = data;
// 		console.log("socket emission");
// 		console.log(
// 			"emitting to:" + roomIdGlobal,
// 			"elements:" + canvasElementsGlobal
// 		);
// 		socket.broadcast.to(roomIdGlobal).emit("drawing", canvasElementsGlobal);
// 		console.log("emitted elements to clinet");
// 		console.log(canvasElementsGlobal);
// 	});
// });

// Define Routes
app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/data", require("./routes/api/data"));
app.use("/api/rooms", require("./routes/api/rooms"));

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
