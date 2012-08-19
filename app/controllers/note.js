// topics
// by Daniel Rodríguez
// MIT Licensed

var app
  , db
  , controller = {}
  , sendError
  , Markdown


module.exports = function(_app) {
  app = _app
  db  = app.server.set('db')
  sendError = app.utils.sendError
  Markdown  = app.Markdown
  return controller
}


// GET /api/1/:screen_name/topic/:topic_id/notes
controller.get_notes = function(req, res) {
  var topic_id    = app.utils.decrypt(req.params.topic_id)
    , user        = req.session.user
    , screen_name = req.params.screen_name

  if (!topic_id || screen_name !== user.screen_name) {
    // This is not the logged in user
    return sendError(401, 'Seems like you\'re not logged in!', res)
  }

  function foundNotes(err, _notes) {
    if (err) {
      return sendError(500, err, res)
    }
    var notes = []
      , note
      , i = 0

    // Sorting notes
    _notes = _notes.sort(function(a, b) {
      return a.position - b.position
    })

    for (; note = _notes[i]; i++) {
      notes.push({
        _id      : app.utils.encrypt(note._id.toString())
      , text     : note.text
      , parsed   : Markdown.parse(note.text)
      , user_id  : note.user_id
      , topic_id : note.topic_id
      })
    }

    res.send(notes)

  }

  db.notes.find({ topic_id : topic_id,  user_id : user.user_id }, foundNotes)

}


// POST /api/1/note
// Receives a JSON with the new note model
controller.create_note = function(req, res) {
  var user_id  = req.body.user_id

  if (user_id !== req.session.user.user_id) {
    // This is not the logged in user
    return sendError(401, 'Seems like you\'re not logged in!', res)
  }

  db.notes.create(req.body, function(err, note) {
    if (err) {
      return sendError(500, err, res)
    }

    res.send({
      _id      : app.utils.encrypt(note._id.toString())
    , text     : note.text
    , parsed   : Markdown.parse(note.text)
    , user_id  : note.user_id
    , topic_id : note.topic_id
    })
  })
}


// DELETE /api/1/:screen_name/topic/:topic_id/note/:_id
controller.delete_note = function(req, res) {
  var user        = req.session.user
    , screen_name = user.screen_name
    , user_id     = user.user_id
    , topic_id    = app.utils.decrypt(req.params.topic_id)
    , _id         = app.utils.decrypt(req.params._id)

  if (!(user_id && screen_name === req.params.screen_name)) {
    return sendError(401, 'Seems like you\'re not logged in!', res)
  }

  function noteRemoved(err) {
    if (err) {
      return sendError(500, err, res)
    }

    // Updating topic's stats
    db.topics.update({
      _id     : topic_id
    , user_id : user_id
    }, {
      $inc       : { 'stats.notes' : -1 }
    , updated_at : new Date()
    }, topicUpdated)
  }

  function topicUpdated(err) {
    if (err) {
      return sendError(500, err, res)
    }

    // Updating user's stats
    db.users.update({
      user_id : user_id
    }, {
      $inc : { 'stats.notes' : -1 }
    }, done)
  }

  function done(err) {
    if (err) {
      return sendError(500, err, res)
    }
    res.send({})
  }

  db.notes.remove({
    _id      : _id
  , user_id  : user_id
  , topic_id : topic_id
  }, noteRemoved)

}


// PUT /api/1/:screen_name/topic/:topic_id/note/:_id
controller.update_note = function(req, res) {
  var user        = req.session.user
    , screen_name = user.screen_name
    , user_id     = user.user_id
    , topic_id    = app.utils.decrypt(req.params.topic_id)
    , _id         = app.utils.decrypt(req.params._id)
    , note

  // New values
  var text = req.body.text

  if (!(user_id && screen_name === req.params.screen_name)) {
    return sendError(401, 'Seems like you\'re not logged in!', res)
  }

  function foundNote(err, _note) {
    if (err || !_note) {
      return sendError(500, err, res)
    }
    note = _note
    note.text = text
    note.save(done)
  }

  function done(err) {
    if (err) {
      return sendError(500, err, res)
    }
    res.send({
      _id      : app.utils.encrypt(note._id.toString())
    , text     : note.text
    , parsed   : Markdown.parse(note.text)
    , user_id  : note.user_id
    , topic_id : note.topic_id
    })
  }

  db.notes.findOne({
    _id      : _id
  , user_id  : user_id
  , topic_id : topic_id
  }, foundNote)

}
