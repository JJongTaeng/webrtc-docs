import http from "http";
import SocketIO from 'socket.io';
import express from 'express';
import { join } from "path";

const app = express();

app.set('view engine', 'pug');
app.set("views", join(__dirname, '/views'));
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on('connection', (socket) => {
  socket.on('joinRoom', (roomName) => {
    socket.join(roomName);
    socket.to(roomName).emit('welcome');
  });
  socket.on('offer', (offer, roomName) => {
    socket.to(roomName).emit('offer', offer);
  });
  socket.on('answer', (answer, roomName) => {
    socket.to(roomName).emit('answer', answer);
  });
  socket.on('ice', (ice, roomName) => {
    socket.to(roomName).emit('ice', ice);
  });
})

httpServer.listen(3030, () => console.log('Listening to http://localhost:3030'));