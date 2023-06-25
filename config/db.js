const mongoose = require('mongoose');
const logger = require('./logger.config');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE_URI);

    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(error);
  }
};

module.exports = connectDB;
