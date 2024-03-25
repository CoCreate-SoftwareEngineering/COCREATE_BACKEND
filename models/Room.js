const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
	roomId: {
		type: String,
		required: true,
	},
	roomName: {
		type: String,
		required: true,
	},
	elements: {
		type: Object,
		required: true,
	},
	members: [
		{
			type: String,
			required: true,
		},
	],
});
module.exports = Room = mongoose.model("room", RoomSchema);
