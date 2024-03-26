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

//KACPER WUZ HEER
var STATIC_CHANNELS = [{
    name: 'Global chat',
    participants: 0,
    id: 1,
    sockets: []
}, {
    name: 'Funny',
    participants: 0,
    id: 2,
    sockets: []
}];
//KACPER ESCAPES

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

	//KACPER WUZ HEER
	socket.emit('MsgConnection', null);

	socket.on('channel-join', id => {
		console.log('channel join', id);
		STATIC_CHANNELS.forEach(c => {
			if (c.id === id) {
				if (c.sockets.indexOf(socket.id) == (-1)) {
					c.sockets.push(socket.id);
					c.participants++;
					io.emit('channel', c);
				}
			} else {
				let index = c.sockets.indexOf(socket.id);
				if (index != (-1)) {
					c.sockets.splice(index, 1);
					c.participants--;
					io.emit('channel', c);
				}
			}
		});

		return id;
	});
	socket.on('send-message', message => {
		io.emit('message', message);
	});

	socket.on('disconnect', () => {
		STATIC_CHANNELS.forEach(c => {
			let index = c.sockets.indexOf(socket.id);
			if (index != (-1)) {
				c.sockets.splice(index, 1);
				c.participants--;
				io.emit('channel', c);
			}
		});
	});
	//KACPER ESCAPES

	socket.on("userJoined", async (data) => {
		console.log("User has joined a room");
		roomIdGlobal = data;
		console.log("sending users in room..")
	socket.emit("roomUsers", (getAllUsers(roomIdGlobal))) //send all users that were already in room before joining ourseles
		socket.join(roomIdGlobal);
		console.log(data);

		console.log("Room onboarding complete");
	});
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

//KACPER LEAVES HIS MARK BELOW!!!!!!!!
/**
 * @description This methos retirves the static channels
 */
app.get('/getChannels', (req, res) => {
    res.json({
        channels: STATIC_CHANNELS
    })
});