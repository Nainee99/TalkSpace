import { genSalt, hash } from "bcrypt"; // Don't forget to import hash
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please provide an email address"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
  },
  firstName: {
    type: String,
    required: false,
  },
  lastName: {
    type: String,
    required: false,
  },
  image: {
    type: String,
    default: "",
    required: false,
  },
  color: {
    type: Number,
    default: "",
    required: false,
  },
  profileSetup: {
    type: Boolean,
    default: false,
  },
});

// Use the pre middleware on UserSchema
UserSchema.pre("save", async function (next) {
  const salt = await genSalt(10); // Specify salt rounds
  this.password = await hash(this.password, salt);
  next();
});

const User = mongoose.model("User", UserSchema);

export default User;
