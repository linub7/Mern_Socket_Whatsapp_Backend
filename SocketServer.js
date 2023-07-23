module.exports = (socket) => {
  // user joins or opens the application
  socket.on('join', (user) => {
    console.log('user has joined: ', user);
    socket.join(user);
  });

  // join a conversation room
  socket.on('join-conversation', (conversation) => {
    socket.join(conversation);
    console.log('user has joined conversation: ', conversation);
  });
};
