const express = require('express');
const trimRequest = require('trim-request');

const {
  signup,
  signin,
  forgotPassword,
  resetPassword,
  updatePassword,
  signoutUser,
} = require('../controllers/auth');
const { protect } = require('../middleware/auth');
const { uploadImage } = require('../middleware/multer');

const router = express.Router();

router.post('/auth/forgot-password', trimRequest.all, forgotPassword);
router.patch('/auth/reset-password/:token', trimRequest.all, resetPassword);
router.patch(
  '/auth/update-my-password',
  trimRequest.all,
  protect,
  updatePassword
);

router.post(
  '/auth/signup',
  trimRequest.all,
  uploadImage.single('picture'),
  signup
);
router.post('/auth/signin', trimRequest.all, signin);
router.get('/auth/signout', trimRequest.all, protect, signoutUser);

module.exports = router;
