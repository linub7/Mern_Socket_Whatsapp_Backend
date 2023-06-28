const express = require('express');
const trimRequest = require('trim-request');

const {
  createOrOpenConversation,
  getConversations,
} = require('../controllers/conversation');
const { protect } = require('../middleware/auth');

const router = express.Router();

router
  .route('/conversations')
  .get(trimRequest.all, protect, getConversations)
  .post(trimRequest.all, protect, createOrOpenConversation);

module.exports = router;
