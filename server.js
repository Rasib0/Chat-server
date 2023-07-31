const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const io = new Server(server);

function connectDB() {
  mongoose
    .connect("mongodb://localhost:27017/chat", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.log(err);
    });
}

makeSchema = () => {
  const chatSchema = new mongoose.Schema({
    name: String,
    msg: String,
  });
};

const Chat = mongoose.model("Chat", chatSchema);

app.use(express.static("public")); //for server

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/api/messages", (req, res) => {
  Chat.find({}, (err, messages) => {
    res.send(messages);
  });
});

app.post("/api/messages", (req, res) => {
  const chat = new Chat(req.body);
  chat.save((err) => {
    if (err) sendStatus(500);
    io.emit("chat message", req.body);
    res.sendStatus(200);
  });
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });
});

server.listen(5000, () => {
  console.log("Server is running on port 5000");
});
