// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    match: /^\S+@\S+\.\S+$/,
  },
  thoughts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Thought' }],
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

userSchema.virtual('friendCount').get(function () {
    return this.friends.length;
  });
  
  userSchema.pre('remove', async function (next) {
    try {
      // Find all thoughts associated with the user and delete them
      const thoughts = await this.model('Thought').find({ _id: { $in: this.thoughts } });
      for (const thought of thoughts) {
        await thought.remove();
      }
      next();
    } catch (err) {
      next(err);
    }
  });
  
  
  const User = mongoose.model('User', userSchema);
  
  module.exports = User;