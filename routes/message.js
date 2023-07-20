const express = require('express');
const trimRequest = require('trim-request');
const { isValidObjectId } = require('mongoose');

const { sendMessage, getMessages } = require('../controllers/message');
const { protect } = require('../middleware/auth');
const { uploadImage } = require('../middleware/multer');
const AppError = require('../utils/AppError');

const router = express.Router();

router.param('id', (req, res, next, val) => {
  if (!isValidObjectId(val)) {
    return next(new AppError('Please provide a valid id', 400));
  }
  next();
});

router.route('/messages/:id').get(trimRequest.all, protect, getMessages);

router
  .route('/messages')
  .post(trimRequest.all, protect, uploadImage.array('files'), sendMessage);

module.exports = router;
