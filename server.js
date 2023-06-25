const dotenv = require('dotenv');
const connectDB = require('./config/db');
const logger = require('./config/logger.config');

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
