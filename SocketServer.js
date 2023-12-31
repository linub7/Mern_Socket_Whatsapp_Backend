let onlineUsers = [];

module.exports = (socket, io) => {
  // user joins or opens the application
  socket.on('join', (user) => {
    socket.join(user);
    if (!onlineUsers.some((el) => el.userId === user)) {
      onlineUsers.push({ userId: user, socketId: socket?.id });
    }
    // send online users
    io.emit('get-online-users', onlineUsers);

    // send socket id
    io.emit('setup-socket', socket.id);
  });

  // socket disconnect
  socket.on('disconnect', () => {
    onlineUsers = onlineUsers.filter((el) => el.socketId !== socket.id);
    io.emit('get-online-users', onlineUsers);
  });

  // join a conversation room
  socket.on('join-conversation', (conversation) => {
    socket.join(conversation);
  });

  // send and receive message
  socket.on('send-message', (message) => {
    const { conversation } = message;
    if (!conversation.users) return;
    conversation?.users?.forEach((user) => {
      if (user?._id === message?.sender?._id) return;
      socket.in(user?._id).emit('receive-message', message);
    });
  });

  // typing
  socket.on('typing', (conversation) => {
    socket.in(conversation).emit('typing');
  });

  // stop-typing
  socket.on('stop-typing', (conversation) => {
    socket.in(conversation).emit('stop-typing');
  });

  // call
  socket.on('call-user', (data) => {
    const { userToCall, signal, from, name, picture } = data;
    const userSocket = onlineUsers?.find((el) => el.userId === userToCall);
    io.to(userSocket?.socketId).emit('call-user', {
      signal,
      from,
      name,
      picture,
    });
  });
};
