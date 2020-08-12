//frameworks that creates http methods and sets up routes 
const express = require("express");
//morgan shows http method
const logger = require("morgan");
//framework that sets up the db
const mongoose = require("mongoose");
//compression is used for middleware and compresses response bodies
const compression = require("compression");

const PORT = process.env.PORT || 3000;

const app = express();

//middleware setting up your use of the data in the req res cycle
app.use(logger("dev"));

//middleware and handles server side events
app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/budget", {
  useNewUrlParser: true,
  useFindAndModify: false
});

// routes
app.use(require("./routes/api.js"));

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});