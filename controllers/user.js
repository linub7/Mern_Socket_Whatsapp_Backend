const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const AppError = require('../utils/AppError');

exports.searchUsers = asyncHandler(async (req, res, next) => {
  const {
    user,
    query: { searchTerm },
  } = req;

  if (!searchTerm?.trim())
    return next(new AppError('OOPS! Something went wrong!', 400));

  const result = await User.find({
    _id: { $ne: user.id },
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { email: { $regex: searchTerm, $options: 'i' } },
    ],
  }).select('name picture status');

  return res.json({
    status: 'success',
    data: {
      data: result,
    },
  });
});
