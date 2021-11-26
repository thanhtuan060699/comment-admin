'use strict'
var commentController = require('../controllers/comment.controller');

module.exports = (app) =>{
    app.route('/api/comment').post(commentController.save)
       .get(commentController.get)
}