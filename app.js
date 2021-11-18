const fs = require("fs");
var http = require("http");
var https = require("https");
var privateKey = fs.readFileSync("./sec/server.key", "utf8");
var certificate = fs.readFileSync("./sec/server.cert", "utf8");

var credentials = { key: privateKey, cert: certificate };
const express = require("express");
const app = express();

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

//const server = require("http").Server(app);
const io = require("socket.io")(httpsServer);
const { v4: uuidV4 } = require("uuid");

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);
    console.log("User connected: " + userId);

    socket.on("disconnect", () => {
      socket.to(roomId).broadcast.emit("user-disconnected", userId);
      console.log("User disconnected: " + userId);
    });
  });
});

//httpServer.listen(8080);
try {
  httpsServer.listen(8443);
  console.log("HTTPS server listening on 8443");
} catch (e) {
  console.log("Error appeared: ", e.message);
}
