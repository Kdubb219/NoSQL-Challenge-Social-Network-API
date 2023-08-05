const express = require('express');
const app = express();
const db = require('./db');
const apiRoutes = require('./routes/api');

// Middleware
app.use(express.json());

// Use the API routes
app.use('/api', apiRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});