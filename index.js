// server.js
const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
  },
});

app.use(cors());
app.use(express.json());

let users = [];

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinRoom', ({ userName }) => {
    users.push({ id: socket.id, name: userName });
    io.emit('userList', users); // Update all clients with the current user list
    console.log(users);
  });

  socket.on('sendMessage', ({ message, recipientId }) => {
    // Send message to specific user
    if (recipientId) {
      io.to(recipientId).emit('receiveMessage', message);
    } else {
      // Fallback to broadcasting if recipientId is not specified
      io.emit('receiveMessage', message);
    }
  });

  socket.on('disconnect', () => {
    users = users.filter((user) => user.id !== socket.id);
    io.emit('userList', users);
    console.log('A user disconnected:', socket.id);
  });
});

const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
