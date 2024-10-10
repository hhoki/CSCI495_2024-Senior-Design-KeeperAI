
require("dotenv").config(); // ALLOWS ENVIRONMENT VARIABLES TO BE SET ON PROCESS.ENV SHOULD BE AT TOP

const express = require('express');
const path = require('path');
const app = express();


app.use(express.json());


app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'contact.html'));
});


app.use("/books", require("./routes/bookRoutes"));
app.use("/ai_performance", require("./routes/performanceRoutes"));
app.use("/model_configurations", require("./routes/aiConfigRoutes"));
app.use("/detections", require("./routes/detectionRoutes"));
app.use("/shelf", require("./routes/shelfRoutes"));

app.use((err, req, res, next) => {
    console.log(err.stack);
    console.log(err.name);
    console.log(err.code);
  
    res.status(500).json({
      message: "Something went really wrong",
    });
  });


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));