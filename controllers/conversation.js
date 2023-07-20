const { isValidObjectId } = require('mongoose');

const asyncHandler = require('../middleware/async');
const AppError = require('../utils/AppError');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

exports.createOrOpenConversation = asyncHandler(async (req, res, next) => {
  const {
    user,
    body: { receiverId },
  } = req;
  const senderId = user.id;

  if (!receiverId)
    return next(new AppError('Please provide a receiver ID', 400));

  if (!isValidObjectId(receiverId))
    return next(new AppError('Please provide a valid receiver ID', 400));

  if (receiverId.toString() === senderId.toString())
    return next(
      new AppError('You can not create a conversation with yourself!', 400)
    );

  let isAlreadyExistedConversation = await Conversation.find({
    isGroup: false,
    // in users fields -> exist senderId AND($and) receiverId
    $and: [
      { users: { $elemMatch: { $eq: senderId } } },
      { users: { $elemMatch: { $eq: receiverId } } },
    ],
  });

  if (!isAlreadyExistedConversation)
    return next(new AppError('OOPS! something went wrong!', 400));

  isAlreadyExistedConversation = await Conversation.populate(
    isAlreadyExistedConversation,
    {
      path: 'latestMessage.sender',
      select: 'name email picture status',
    }
  );

  const conversation = isAlreadyExistedConversation[0];

  if (!conversation) {
    const receiver = await User.findById(receiverId);
    if (!receiver) return next(new AppError('User not found!', 404));

    const newConversation = await Conversation.create({
      name: receiver.name,
      picture: receiver?.picture,
      isGroup: false,
      users: [senderId, receiver._id],
    });
    if (!newConversation)
      return next(new AppError('OOPS! something went wrong!', 400));

    const populatedNewConversation = await Conversation.findOne({
      _id: newConversation._id,
    })
      .populate('users', 'name picture')
      .populate('latestMessage', 'message sender createdAt');

    return res.json({
      status: 'success',
      data: { data: populatedNewConversation },
    });
  }

  return res.json({
    status: 'success',
    data: {
      data: conversation,
    },
  });
});

exports.getConversations = asyncHandler(async (req, res, next) => {
  const { user } = req;
  const conversations = await Conversation.find({
    users: { $elemMatch: { $eq: user._id } },
  })
    .populate('users', 'name picture')
    .populate('latestMessage', 'message sender createdAt')
    .sort('-updatedAt');

  return res.json({
    status: 'success',
    data: { data: conversations },
  });
});
