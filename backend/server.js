// backend/server.js

const express = require('express');
const cors = require('cors');
const path = require('path');
const { blizzardAuth } = require('./config/blizzard');
const gearRoutes = require('./routes/gearRoutes');
const characterMediaRoutes = require('./routes/characterMediaRoutes');  // Import the new route for character media

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Blizzard API auth
blizzardAuth();

// API Routes
app.use('/api/gear', gearRoutes);
app.use('/api/gear/media', characterMediaRoutes);  // Add the new media route

// Serve the frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve the index.html file for any route not caught by the API
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
