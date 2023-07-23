const dotenv = require('dotenv');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const logger = require('./config/logger.config');
const SocketServer = require('./SocketServer');

process.on('uncaughtException', (err) => {
  logger.error('UnCaught REJECTION! Shutting Down ...');
  logger.error(err);
  process.exit(1);
});

dotenv.config({
  path: './config/config.env',
});

connectDB();

const app = require('./app');

const port = process.env.PORT || 8000;
const server = app.listen(port, () =>
  logger.info(`Server is running on port ${port}`)
);

// socket.io
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.FRONTEND_URL,
  },
});

io.on('connection', (socket) => {
  logger.info('socket io connected successfully!');
  SocketServer(socket);
});

// Handle unhandled promise rejection
process.on('unhandledRejection', (err, promise) => {
  logger.error('UnHandled REJECTION! Shutting Down ...');
  logger.error(`Error: ${err.name} ${err.message}`);
  // close sever and exit process
  server.close(() => {
    process.exit(1);
  });
});

// SIGTERM
process.on('SIGTERM', (err) => {
  logger.error(err);
  // close sever and exit process
  server.close(() => {
    process.exit(1);
  });
});
