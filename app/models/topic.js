// topics
// by Daniel Rodríguez
// MIT Licensed

// Modules
const mongoose = require('mongoose')
    , Schema   = mongoose.Schema
    , ObjectId = Schema.ObjectId

var app
  , Topic
  , db

// Simple XSS fix
function noXSS(str) {
  return str.replace(/</g,'&lt;')
}

module.exports = function(_app) {
  app = _app
  return Topic
}

Topic = new Schema({
  _id         : ObjectId
, name        : { type : String }
, user_id     : { type : String, index : true }
, stats       : {
    notes  : { type : Number, default : 0 }
  , visits : { type : Number, default : 0 }
  }
, position    : { type : Number, default : 0  }
, created_at  : { type : Date }
, updated_at  : { type : Date }
})

Topic.pre('save', function(next) {
  this.updated_at = new Date()
  next()
})

Topic.statics.create = function(_topic, callback) {
  var date = new Date()
    , topic
    , user

  if (!db) {
    db = app.server.set('db')
  }

  if (!_topic.name || _topic.name.length > 140) {
    return callback('Invalid Topic Name')
  }
  if (!_topic.user_id) {
    return callback('User\'s ID is required')
  }

  db.users.findOne({ user_id : _topic.user_id }, foundUser)

  function foundUser(err, _user) {
    if (err) {
      return callback(err)
    }
    if (!_user) {
      return callback('User Not Found')
    }
    user = _user
    db.topics.count({ user_id : user.user_id }, countedTopics)
  }

  function countedTopics(err, n_of_topics) {
    if (n_of_topics > 50) {
      return callback('You have more than 50 Topics!!!')
    }
    topic = new db.topics({
      name       : noXSS(_topic.name)
    , user_id    : user.user_id
    , position   : n_of_topics
    , created_at : date
    , updated_at : date
    })
    topic.save(savedTopic)
  }

  function savedTopic(err) {
    if (err) {
      return callback(err)
    }
    db.topics.findOne(topic, foundTopic)
  }

  function foundTopic(err, _topic) {
    if (err) {
      return callback(err)
    }
    if (!_topic) {
      return callback()
    }
    topic = _topic
    user.stats.topics += 1
    user.markModified('stats')
    user.save(savedUser)
  }

  function savedUser(err) {
    if (err) {
      return callback(err)
    }
    callback(null, topic)
  }
}
