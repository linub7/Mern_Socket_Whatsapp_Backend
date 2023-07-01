const express = require('express');
const trimRequest = require('trim-request');

const { searchUsers } = require('../controllers/user');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/users/search').get(trimRequest.all, protect, searchUsers);

module.exports = router;
