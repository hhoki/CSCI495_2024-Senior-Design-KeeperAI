require("dotenv").config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

// =========== Middleware Configuration ===========
// CORS setup
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json());

// =========== Static Files Serving ===========
// Public directory for general static files
app.use(express.static(path.join(__dirname, 'public')));

// Image upload handling
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.gif')) {
      res.setHeader('Content-Type', 'image/gif');
    }
  }
}));

// =========== API Routes ===========
// Book management routes
app.use("/book", require("./routes/bookRoutes"));
app.use("/shelf", require("./routes/shelfRoutes"));

// Image and placeholder routes
app.use('/placeholder', require('./routes/placeholderRoutes'));

// AI and analytics routes
app.use("/ai_performance", require("./routes/performanceRoutes"));
app.use("/model_configurations", require("./routes/aiConfigRoutes"));
app.use("/detections", require("./routes/detectionRoutes"));

// =========== Error Handling ===========
// 404 handler for uploads
app.use('/uploads', (req, res) => {
  res.status(404).send('File not found');
});

// Development vs Production handling
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React build directory
  app.use(express.static(path.join(__dirname, 'client/build')));

  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
} else {
  // In development, catch-all route returns API status
  app.get('*', (req, res) => {
    res.json({
      message: 'API is running',
      env: process.env.NODE_ENV || 'development'
    });
  });
}

// Global error handler
app.use((err, req, res, next) => {
  // Log error details
  console.error('=========== Error ===========');
  console.error('Error details:', err);
  console.error('Request URL:', req.originalUrl);
  console.error('Request method:', req.method);
  console.error('Stack trace:', err.stack);
  console.error('=============================');

  // Send error response
  res.status(err.status || 500).json({
    message: err.message || "Something went wrong",
    error: process.env.NODE_ENV === 'production' ? '🥞' : err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
});

// =========== Server Startup ===========
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('=========== Server Info ===========');
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API URL: http://localhost:${PORT}`);
  console.log('=================================');
});

module.exports = app;