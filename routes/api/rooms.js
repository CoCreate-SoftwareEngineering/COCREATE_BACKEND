const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

const Profile = require("../../models/Profile");
const User = require("../../models/User");
const Room = require("../../models/Room");

// Endpoint to add a new room
router.post("/", async (req, res) => {
	try {
		const { roomId, roomName, elements } = req.body;
		// Create a new room
		const newRoom = new Room({
			roomId,
			roomName,
			elements,
		});

		// Save the new room to the database
		await newRoom.save();

		res.status(201).json({
			success: true,
			message: "Room created successfully",
			room: newRoom,
		});
	} catch (error) {
		console.error("Error creating room:", error);
		res.status(500).json({ success: false, message: "Failed to create room" });
	}
});

router.put("/", [auth], async (req, res) => {
	const { elements, roomId } = req.body;
	console.log(req.body);
	// const newRoom = room;
	try {
		await Room.updateOne({ roomId: roomId }, { $set: { elements: elements } });
		console.log("elements saved");
	} catch (err) {
		console.error(err.message);
		res.status(400).send("Server Error");
	}
});

router.get("/:roomId", async (req, res) => {
	try {
		const roomId = req.params.roomId;
		console.log("ROOM ID");
		console.log(roomId);
		// const roomId = "345f711c-5c5d-0f8a-7ab9-256b20664823";
		const room = await Room.findOne({ roomId: roomId });
		console.log("GET ROOM: ");

		if (!room) {
			return res.status(400).json({ msg: "There is no profile for this user" });
		}

		res.json(room);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server error");
	}
});

router.put("/name", [auth], async (req, res) => {
	const { roomId, roomName } = req.body;
	console.log(req.body);
	// const newRoom = room;
	try {
		await Room.updateOne({ roomId: roomId }, { $set: { roomName: roomName } });
		console.log("elements saved");
	} catch (err) {
		console.error(err.message);
		res.status(400).send("Server Error");
	}
});

router.get("/", [auth], async (req, res) => {
	// console.log(req.user.id);
	console.log("START GET NAMES");
	try {
		const roomNames = [];
		const profile = await Profile.findOne({ user: req.user.id });
		console.log(profile.roomIds);
		for (let i = 0; i < profile.roomIds.length; i++) {
			const room = await Room.findOne({ roomId: profile.roomIds[i] });
			roomNames.push(room.roomName);
		}
		console.log("ROOM NAMES");
		console.log(roomNames);

		res.json(roomNames);
	} catch (err) {
		console.log("GET NAMES ERROR");
		console.error(err.message);
		res.status(500).send("Server error");
	}
});
router.put("/addMember", [auth], async (req, res) => {
	const { roomId } = req.body;
	console.log("ADDING MEMBER");
	console.log(req.user.id);
	// const newRoom = room;
	try {
		const user = await User.findOne({ user: req.user.id });
		const room = await Room.findOne({ roomId: roomId });
		console.log(user.email);
		room.members.push(user.email);
		console.log("Member added");
		console.log(room.members);
		await room.save();
		return res.json(room.members);
	} catch (err) {
		console.error(err.message);
		res.status(400).send("Server Error");
	}
});
// router.put("/addMemberFromSettings", [auth], async (req, res) => {
// 	const { roomId, email } = req.body;
// 	console.log("ADDING MEMBER");
// 	// const newRoom = room;
// 	try {
// 		const user = await User.findOne({ email: email });
// 		if (!user) {
// 			return res.status(400).json({ msg: "There is no user with this email" });
// 		}
// 		const room = await Room.findOne({ roomId: roomId });
// 		console.log(user.email);
// 		room.members.push(user.email);
// 		console.log("Member added");
// 		console.log(room.members);
// 		return res.json(room.members);
// 	} catch (err) {
// 		console.error(err.message);
// 		res.status(400).send("Server Error");
// 	}
// });

module.exports = router;
