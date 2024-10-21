
require("dotenv").config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());


app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static(path.join(__dirname, 'client/build')));

//Routes
app.use("/book", require("./routes/bookRoutes"));
app.use("/ai_performance", require("./routes/performanceRoutes"));
app.use("/model_configurations", require("./routes/aiConfigRoutes"));
app.use("/detections", require("./routes/detectionRoutes"));
app.use("/shelf", require("./routes/shelfRoutes"));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error('Error details:');
  console.error(err);
  console.error('Request URL:', req.url);
  console.error('Request method:', req.method);
  res.status(500).json({
    message: "Something went wrong",
    error: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));