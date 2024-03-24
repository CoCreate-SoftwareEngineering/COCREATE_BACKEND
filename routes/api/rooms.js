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

module.exports = router;
