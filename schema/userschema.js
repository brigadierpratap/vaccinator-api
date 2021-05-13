const mongoose = require("mongoose");
const user = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: [true],
    required: true,
  },
  pinCode: {
    type: Number,
    required: true,
  },
  message_sent: {
    type: Boolean,
    default: false,
  },
  message_time: {
    type: Date,
  },
  age: {
    type: Boolean,
    required: true,
  },
});

const userdata = mongoose.model("user", user);
module.exports = userdata;
