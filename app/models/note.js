// topics
// by Daniel Rodríguez
// MIT Licensed

// Modules
const mongoose = require('mongoose')
    , Schema   = mongoose.Schema
    , ObjectId = Schema.ObjectId

var app
  , Note
  , db

module.exports = function(_app) {
  app = _app
  return Note
}

Note = new Schema({
  _id         : ObjectId
, text        : { type : String }
, user_id     : { type : String, index : true }
, topic_id    : { type : String, index : true }
, position    : { type : Number, default : 0  }
, created_at  : { type : Date }
, updated_at  : { type : Date }
})

Note.pre('save', function(next) {
  this.updated_at = new Date()
  next()
})

Note.statics.create = function(_note, callback) {
  var date = new Date()
    , note
    , user
    , topic

  if (!db) db = app.server.set('db')

  if (!_note.text || _note.text.length > 2048) {
    return callback('Invalid Note Text')
  }
  if (!_note.user_id) {
    return callback('User\'s ID is required')
  }
  if (!_note.topic_id) {
    return callback('Topic\'s ID is required')
  }

  db.users.findOne({ user_id : _note.user_id }, foundUser)

  function foundUser(err, _user) {
    if (err) return callback(err)
    if (!_user) return callback('User Not Found')
    user = _user
    db.topics.findOne({ _id : app.utils.decrypt(_note.topic_id), user_id : _note.user_id }, foundTopic)
  }

  function foundTopic(err, _topic) {
    if (err) return callback(err)
    if (!_topic) return callback('Topic Not Found')
    topic = _topic
    db.notes.count({ topic_id : topic._id,  user_id : user.user_id }, countedNotes)
  }

  function countedNotes(err, n_of_notes) {
    if (n_of_notes > 30) return callback('You have more than 30 Notes in this topic!!!')

    note = new db.notes({
      text       : _note.text
    , user_id    : user.user_id
    , topic_id   : topic._id.toString()
    , position   : n_of_notes
    , created_at : date
    , updated_at : date
    })
    note.save(savedNote)
  }

  function savedNote(err) {
    if (err) return callback(err)
    // The server is not sending back the object...
    // TODO: Is there a way to wait until the server
    // responds with the full object without searching again?
    db.notes.findOne(note, foundNote)
  }

  function foundNote(err, _note) {
    if (err) return callback(err)
    if (!_note) return callback()
    note = _note
    topic.stats.notes += 1
    topic.markModified('stats')
    topic.save(savedTopic)
  }

  function savedTopic(err) {
    if (err) return callback(err)
    user.stats.notes  += 1
    user.markModified('stats')
    user.save(savedUser)
  }

  function savedUser(err) {
    if (err) return callback(err)
    callback(null, note)
  }
}
