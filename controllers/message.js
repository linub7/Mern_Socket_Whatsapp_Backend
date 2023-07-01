const { isValidObjectId } = require('mongoose');

const asyncHandler = require('../middleware/async');
const AppError = require('../utils/AppError');
const handleFactory = require('./handleFactory');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

exports.sendMessage = asyncHandler(async (req, res, next) => {
  const {
    user,
    body: { message, conversation, files },
  } = req;
  if ((!message && !files) || !conversation)
    return next(
      new AppError('Please provide message or files and conversation id', 400)
    );

  if (!isValidObjectId(conversation))
    return next(new AppError('Please provide a valid id', 400));

  const isConversationExist = await Conversation.findById(conversation);

  if (!isConversationExist)
    return next(new AppError('Conversation not found!', 404));

  if (!isConversationExist.isGroup) {
    const isMeAllowedToSendMessageToThisConversation =
      await Conversation.findOne({ _id: conversation, users: user._id });
    if (!isMeAllowedToSendMessageToThisConversation) {
      return next(
        new AppError(
          'You can not send a message to a foreign conversation!',
          403
        )
      );
    }
  }

  const newMessage = await Message.create({
    sender: user.id,
    conversation: isConversationExist._id,
    message,
    files: files || [],
  });

  isConversationExist.latestMessage = newMessage._id;

  await isConversationExist.save({ validateBeforeSave: false });

  return res.json({
    status: 'success',
    data: {
      data: newMessage,
    },
  });
});

exports.getMessages = asyncHandler(async (req, res, next) => {
  const {
    user,
    params: { id: conversationId },
  } = req;

  const isMeAllowedToGetThisConversationMessages = await Conversation.findOne({
    _id: conversationId,
    users: user.id,
  });

  if (!isMeAllowedToGetThisConversationMessages)
    return next(new AppError('You can not read this conversation messages!'));

  const conversationMessages = await Message.find({
    conversation: conversationId,
  }).populate({ path: 'sender', select: 'name picture' });

  return res.json({
    status: 'success',
    data: { data: conversationMessages },
  });
});
