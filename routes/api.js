// routes/api.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Thought = require('../models/Thought');

// GET all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().populate('thoughts friends');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
});

// GET a single user by its _id and populated thought and friend data
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('thoughts friends');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user', error: err.message });
  }
});

// POST a new user
router.post('/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ message: 'Error creating user', error: err.message });
  }
});

// PUT to update a user by its _id
router.put('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: 'Error updating user', error: err.message });
  }
});

// DELETE to remove a user by its _id
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user', error: err.message });
  }
});

router.get('/thoughts', async (req, res) => {
    try {
      const thoughts = await Thought.find();
      res.json(thoughts);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching thoughts', error: err.message });
    }
  });

  router.get('/thoughts/:id', async (req, res) => {
    try {
      const thought = await Thought.findById(req.params.id);
      if (!thought) {
        return res.status(404).json({ message: 'Thought not found' });
      }
      res.json(thought);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching thought', error: err.message });
    }
  });

  router.post('/thoughts', async (req, res) => {
    try {
      const { thoughtText, username, userId } = req.body;
      const thought = new Thought({ thoughtText, username });
      await thought.save();
 
      // Push the thought's _id to the associated user's thoughts array
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
 
      user.thoughts.push(thought._id);
      await user.save();
 
      res.status(201).json(thought);
    } catch (err) {
      res.status(400).json({ message: 'Error creating thought', error: err.message });
    }
  });

  router.put('/thoughts/:id', async (req, res) => {
    try {
      const thought = await Thought.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!thought) {
        return res.status(404).json({ message: 'Thought not found' });
      }
      res.json(thought);
    } catch (err) {
      res.status(400).json({ message: 'Error updating thought', error: err.message });
    }
  });

  router.delete('/thoughts/:id', async (req, res) => {
    try {
      const thought = await Thought.findByIdAndDelete(req.params.id);
      if (!thought) {
        return res.status(404).json({ message: 'Thought not found' });
      }
 
      // Remove the thought's _id from the associated user's thoughts array
      const user = await User.findById(thought.userId);
      if (user) {
        user.thoughts.pull(thought._id);
        await user.save();
      }
 
      res.json({ message: 'Thought deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error deleting thought', error: err.message });
    }
  });

// POST to add a new friend to a user's friend list
router.post('/users/:userId/friends/:friendId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const friend = await User.findById(req.params.friendId);
    if (!friend) {
      return res.status(404).json({ message: 'Friend not found' });
    }

    // Check if the friend is already in the user's friend list
    if (user.friends.includes(friend._id)) {
      return res.status(400).json({ message: 'Friend already in the friend list' });
    }

    // Add the friend to the user's friend list
    user.friends.push(friend._id);
    await user.save();

    res.json({ message: 'Friend added successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error adding friend', error: err.message });
  }
});

router.delete('/users/:userId/friends/:friendId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const friend = await User.findById(req.params.friendId);
    if (!friend) {
      return res.status(404).json({ message: 'Friend not found' });
    }

    // Check if the friend is in the user's friend list
    if (!user.friends.includes(friend._id)) {
      return res.status(400).json({ message: 'Friend not in the friend list' });
    }

    // Remove the friend from the user's friend list
    user.friends.pull(friend._id);
    await user.save();

    res.json({ message: 'Friend removed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error removing friend', error: err.message });
  }
});

  router.post('/thoughts/:thoughtId/reactions', async (req, res) => {
    try {
      const thought = await Thought.findById(req.params.thoughtId);
      if (!thought) {
        return res.status(404).json({ message: 'Thought not found' });
      }
 
      // Assuming the request body contains the necessary reaction data
      const { reactionBody, username } = req.body;
      const newReaction = { reactionBody, username };
      thought.reactions.push(newReaction);
      await thought.save();
 
      res.status(201).json(newReaction);
    } catch (err) {
      res.status(400).json({ message: 'Error creating reaction', error: err.message });
    }
  });

  router.delete('/thoughts/:thoughtId/reactions/:reactionId', async (req, res) => {
    try {
      const thought = await Thought.findById(req.params.thoughtId);
      if (!thought) {
        return res.status(404).json({ message: 'Thought not found' });
      }
 
      // Find the index of the reaction with the specified reactionId
      const reactionIndex = thought.reactions.findIndex(
        (reaction) => reaction.reactionId.toString() === req.params.reactionId
      );
 
      if (reactionIndex === -1) {
        return res.status(404).json({ message: 'Reaction not found' });
      }
 
      // Remove the reaction from the reactions array
      thought.reactions.splice(reactionIndex, 1);
      await thought.save();
 
      res.json({ message: 'Reaction deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error deleting reaction', error: err.message });
    }
  });

module.exports = router;
