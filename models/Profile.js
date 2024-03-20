const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "user",
	},
	rooms: [
		{
			roomId: {
				type: String, // Assuming roomId is a string, adjust as needed
				required: true,
			},
			roomName: {
				type: String, // Assuming roomName is a string, adjust as needed
				required: true,
			},
		},
	],
});
module.exports = Profile = mongoose.model("profile", ProfileSchema);
