const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

const Profile = require("../../models/Profile");
const User = require("../../models/User");

// @route GET api/profile/me
// @desc Get current user's profile
// @access Private
router.get("/me", auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id }).populate(
			"user",
			["name"]
		);

		if (!profile) {
			return res.status(400).json({ msg: "There is no profile for this user" });
		}

		res.json(profile);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server error");
	}
});

// @route POST api/profile
// @desc Create or update a user profile
// @access Private
router.post("/", [auth], async (req, res) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const { locations } = req.body;

	// Build Profile Object
	const profileFields = {};
	profileFields.user = req.user.id;
	console.log("Build Profile: " + req.user.id);
	if (locations) {
		profileFields.locations = locations
			.split(",")
			.map((locations) => locations.trim());
	}

	try {
		let profile = await Profile.findOne({ user: req.user.id });

		if (profile) {
			profile = await Profile.findOneAndUpdate(
				{ user: req.user.id },
				{ $set: profileFields },
				{ new: true }
			);
			return res.json(profile);
		}

		//Create
		profile = new Profile(profileFields);

		await profile.save();

		res.json(profile);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("server Error");
	}
});

// @route DELETE api/profile
// @desc Delete profile and user
// @access Private
router.delete("/", async (req, res) => {
	try {
		// Remove Profile
		await Profile.findOneAndRemove({ user: req.user.id });
		// Remove User
		await User.findOneAndRemove({ _id: req.user.id });
		res.json({ msg: "User removed" });
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Sever Error");
	}
});

// @route PUT api/profile/location
// @desc Add location
// @access Private
router.put("/location", [auth], async (req, res) => {
	const locations = req.body.locations;
	console.log(req);
	const newLocations = locations;
	try {
		const profile = await Profile.findOne({ user: req.user.id });

		profile.locations.push(newLocations);

		await profile.save();

		res.json(profile);
	} catch (err) {
		console.error(err.message);
		res.status(400).send("Server Error");
	}
});

// @route POST api/profile/rooms
// @desc Add location
// @access Private
router.put("/rooms", [auth], async (req, res) => {
	const room = req.body;
	console.log("Putting room");
	const newRoomId = room.roomId;
	try {
		const profile = await Profile.findOne({ user: req.user.id });
		profile.roomIds.push(newRoomId);

		await profile.save();

		res.json(profile);
	} catch (err) {
		console.error(err.message);
		res.status(400).send("Server Error");
	}
});
router.put("/rooms/addMember", [auth], async (req, res) => {
	const { roomId, email } = req.body;

	try {
		console.log("RECIEVED ADD MEMBER");
		const room = await Room.findOne({ roomId: roomId });
		const user = await User.findOne({ email: email });
		if (!user) {
			console.log("Cant find user");
			return res.status(400).json({ msg: "There is no user with this email" });
		}
		console.log(user);
		console.log(user.id);
		const profile = await Profile.findOne({ user: user.id });
		console.log("ADD MEMBER ACTION");
		console.log(room);
		console.log(profile);
		console.log(user.firstName);
		profile.roomIds.push(room.roomId);
		room.members.push(email);
		console.log(room);

		await profile.save();
		await room.save();

		return res.json(room.members);
	} catch (err) {
		console.error(err.message);
		res.status(400).send("Server Error");
	}
});

// @route DELETE api/profile/locations/:location
// @desc Delete location
// @access Private
router.put("/rooms/leaveRoom/:roomId", [auth], async (req, res) => {
	try {
		console.log("Leaving room");
		const roomId = req.params.roomId;
		const userId = req.user.id;
		// const profile = await Profile.findOne({ user: req.user.id });
		// const room = await Room.findOne({ roomId: roomId });
		const user = await User.findOne({ user: req.user.id });

		const room = await Room.updateOne(
			{ roomId: roomId }, // Match documents where the member's email exists in the members array
			{ $pull: { members: user.email } } // Pull the matching email from the members array
		);
		console.log("New members");
		console.log(room.members);
		console.log(roomId);

		const profile = await Profile.updateOne(
			{ user: userId }, // Match documents where the member's email exists in the members array
			{ $pull: { roomIds: roomId } } // Pull the matching email from the members array
		);

		// const removeIndexRoom = Room.members.indexOf(req.params.roomId);
		// const removeIndex = profile.rooms.indexOf(user.email);
		console.log(profile);

		console.log("MY Rooms:");
		console.log(profile.rooms);
		console.log("ROOM MEMBERS:");
		console.log(room.members);

		// await profile.save();
		// await room.save();

		return res.json({ rooms: profile.rooms, members: room.members });


		res.json({ rooms: profile.rooms, members: rooms.members });
	} catch (err) {
		console.error(err.message);
		res.status(400).send("Server Error");
	}
});

module.exports = router;
