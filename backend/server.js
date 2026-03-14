const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes Imports
const templateRoutes = require('./src/routes/templateRoutes');
const workspaceRoutes = require('./src/routes/workspaceRoutes');
const promptRoutes = require('./src/routes/promptRoutes');

// Mount Routes
app.use('/api/v1', templateRoutes);
app.use('/api/v1', workspaceRoutes);
app.use('/api/v1', promptRoutes);

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Prompting App Backend is running!' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
