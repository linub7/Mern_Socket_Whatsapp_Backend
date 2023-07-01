const mongoose = require('mongoose');

const { Schema } = mongoose;

const MessageSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    message: {
      type: String,
      trim: true,
    },
    conversation: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
    },
    files: [],
  }, // without toJSON: { virtuals: true }, toObject: { virtuals: true } our virtual field will now show
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// MessageSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'sender',
//     select: 'name email picture',
//   });
//   this.populate({
//     path: 'conversation',
//     select: 'name isGroup users',
//     populate: {
//       path: 'users',
//       select: 'name email picture',
//     },
//   });

//   next();
// });

module.exports = mongoose.model('Message', MessageSchema);
