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

  db.notes.find({ topic_id : topic_id,  user_id : user.user_id }, foundNotes)

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
}


// POST /api/1/:screen_name/topic/:topic_id/notes/sort
controller.sort_notes = function(req, res) {
  var screen_name = req.params.screen_name
    , topic_id    = app.utils.decrypt(req.params.topic_id)
    , positions   = req.body.positions
    , user        = req.session.user

  try {
    positions = positions.map(function(e) {
      return app.utils.decrypt(e)
    })
  } catch(e) {
    return res.send('[]')
  }

  if (screen_name !== user.screen_name) {
    // This is not the logged in user
    return res.send('[]')
  }

  db.notes.find({ topic_id : topic_id,  user_id : user.user_id }, foundNotes)

  function foundNotes(err, _notes) {
    if (err) {
      return sendError(500, err, res)
    }
    var notes = {}
      , l      = _notes.length - 1

    // Sorting notes
    _notes.forEach(function(e, p) {
      notes[e._id] = e
      if (!(l - p)) {
        loopPositions(0)
      }
    })

    function loopPositions(p) {
      var note = notes[positions[p]]
      note.position = p
      note.save(function() {
        if (l - p) {
          loopPositions(p + 1)
        } else {
          done()
        }
      })
    }
  }

  function done() {
    res.send({ status : 'ok' })
  }
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

  db.notes.remove({
    _id      : _id
  , user_id  : user_id
  , topic_id : topic_id
  }, noteRemoved)

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

  db.notes.findOne({
    _id      : _id
  , user_id  : user_id
  , topic_id : topic_id
  }, foundNote)

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
}
