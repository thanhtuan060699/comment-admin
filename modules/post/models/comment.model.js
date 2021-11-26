const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const CommentSchema = new Schema({
  userId: {
    type: String,
    require: true,
  },
  postId: {
    type: String,
    require: true,
  },
  content: {
    type: String,
    default : ''
  },
  parentId: {
    type: Schema.ObjectId,
  },
},{
  timestamps: true,
});

mongoose.model('Comment', CommentSchema);