const mongoose = require('mongoose');

const { Schema } = mongoose;

const ConversationSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Conversation name is required!'],
      trim: true,
    },
    picture: {
      type: Object,
      url: String,
      public_id: String,
    },
    isGroup: {
      type: Boolean,
      required: true,
      default: false,
    },
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    latestMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  }, // without toJSON: { virtuals: true }, toObject: { virtuals: true } our virtual field will now show
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// ConversationSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'users',
//     select: 'name email picture',
//   });
//   this.populate({
//     path: 'admin',
//     select: 'name email status picture',
//   });
//   this.populate({
//     path: 'latestMessage',
//     select: 'message',
//   });

//   next();
// });

module.exports = mongoose.model('Conversation', ConversationSchema);
