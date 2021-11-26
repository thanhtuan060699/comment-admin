'use strict'

const mongoose = require('mongoose');
const moment = require('moment')
const Comment = mongoose.model('Comment')

exports.save = async (req, res)=>{
  const userId =  req.body.userId,
        content = req.body.content,
        postId = req.body.postId,
        parentId = req.body.parentId;
  
  if(!userId || !content || !postId){
    return res.status(500).send({
            message: 'Missing params'
           });
  }
  if(parentId){
    const parentComment = await Comment.findOne({_id : parentId}).exec();
    if(!parentComment){
      return res.status(500).send({
        message: 'Not found comment parent'
       });
    }
  }
  Comment.create({
    userId:   userId+'',
    content:  content+ '',
    postId:   postId+'',
    parentId: parentId,
  }, (err, comment) =>
  {
    if (err) { return res.status(400).send({ message: err }); }
    return res.status(200).json(comment)
  });
}


exports.get = async (req, res)=>{
  try {
    let limit = parseInt(req.query.limit),
    page = parseInt(req.query.page),
    parentId = req.query.parent,
    postId = req.query.post

    if(!limit || !page || !postId){
      return res.status(500).send({message: 'Missing params'})
    }

    if(parentId){
      const parentComment = await Comment.findOne({_id : parentId}).exec();
      if(!parentComment){
        return res.status(500).send({
          message: 'Not found comment parent'
        });
      }
    }
    const skip = limit*(page-1);
    if(parentId){
      var aggregatePipeline = [
        {
          $match: {
            parentId: mongoose.Types.ObjectId(parentId),
            postId: postId
          },
        },
        {
          $sort: {
            createdAt: 1
          }
        },
        {
          $skip: skip,
        },
        {
          $limit: limit
        }
      ];
    }else{
      var aggregatePipeline = [
        {
          $match: {
            parentId: {$exists : false},
            postId: postId
          },
        },
        {
          $sort: {
            createdAt: 1
          }
        },
        {
          $skip: skip,
        },
        {
          $limit: limit
        }
      ];
    }
    
    Comment.aggregate(aggregatePipeline).exec(async(err, comments)=>{
      if(err){
        return res.status(401).send({err});
      }

      if(comments && comments.length>0){
        for(let i=0; i< comments.length; i++){
          let commentChilds = await Comment.find({parentId : mongoose.Types.ObjectId(comments[i]._id)}).exec();
          console.log(commentChilds)
          if(commentChilds && commentChilds.length>0){
            comments[i].childComment = true;
            comments[i].amountChild = commentChilds.length;
          }else{
            comments[i].childComment = false;
          }
        }

      }
      return res.status(200).send({comments})
    })
  } catch (error) {
    return res.status(401).send({error});
  }
  

}
