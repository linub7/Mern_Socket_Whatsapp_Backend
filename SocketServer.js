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

  // send and receive message
  socket.on('send-message', (message) => {
    console.log('new message received', message);
    const { conversation } = message;
    if (!conversation.users) return;
    conversation?.users?.map((user) => {
      if (user?._id === message?.sender?._id) return;
      socket.in(user?._id).emit('receive-message', message);
    });
  });
};
