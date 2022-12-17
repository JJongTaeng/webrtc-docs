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
const wsServer = SocketIO(httpServer, { path: '/socket.io'});
wsServer.on('connection', (socket) => {
  socket.on('joinRoom', ({ roomName }) => {
    socket.join(roomName);
    socket.emit('myId', { myId: socket.id });
    socket.to(roomName).emit('welcome', { callerId: socket.id });
  });
  socket.on('offer', ({ offer, callerId, receiverId }) => {
    socket.to(receiverId).emit('offer', { sdp: offer, callerId });
  });
  socket.on('answer', ({ answer, callerId, receiverId }) => {
    socket.to(receiverId).emit('answer', { sdp: answer, callerId});
  });
  socket.on('ice', ({ ice, callerId, receiverId }) => {
    socket.to(receiverId).emit('ice', { ice, callerId });
  });
  socket.on('disconnect', () => {
  })
})

httpServer.listen(3030, () => console.log('Listening to http://localhost:3030'));