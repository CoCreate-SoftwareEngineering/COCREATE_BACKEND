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

module.exports = router;
