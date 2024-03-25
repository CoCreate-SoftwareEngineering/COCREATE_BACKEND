const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "user",
	},
	roomIds: [
		{
			type: String, // Assuming roomId is a string, adjust as needed
			required: true,
		},
	],
});
module.exports = Profile = mongoose.model("profile", ProfileSchema);
