// topics
// by Daniel Rodríguez
// MIT Licensed

const mailer = require('nodemailer')
    , jade   = require('jade')
    , fs     = require('fs')

var app
  , db
  , controller = {}
  , sendError
  , Markdown


module.exports = function(_app) {
  app = _app
  db  = app.server.set('db')
  Markdown  = app.Markdown
  sendError = app.utils.sendError
  return controller
}


// GET /api/1/:screen_name/topic/:_id
controller.get_topic = function(req, res) {
  var topic_id    = app.utils.decrypt(req.params._id)
    , screen_name = req.params.screen_name
    , user        = req.session.user

  if (!topic_id || !user || screen_name !== user.screen_name) {
    // This is not the logged in user
    return res.send('{}')
  }

  db.topics.findOne({ _id : topic_id,  user_id : user.user_id }, foundTopic)

  function foundTopic(err, _topic) {
    if (err) {
      return sendError(500, err, res)
    }
    res.send({
      _id     : app.utils.encrypt(_topic._id.toString())
    , name    : _topic.name
    , user_id : _topic.user_id
    , stats   : _topic.stats
    })
  }
}


// GET /api/1/:screen_name/topics
controller.get_topics = function(req, res) {
  var screen_name = req.params.screen_name
    , user = req.session.user

  if (screen_name !== user.screen_name) {
    // This is not the logged in user
    return res.send('[]')
  }

  db.topics.find({ user_id : user.user_id }, foundTopics)

  function foundTopics(err, _topics) {
    if (err) {
      return sendError(500, err, res)
    }
    var topics = []
      , topic
      , i = 0

    // Sorting topics
    _topics = _topics.sort(function(a, b) {
      return a.position - b.position
    })

    for (; topic = _topics[i]; i++) {
      topics.push({
        _id     : app.utils.encrypt(topic._id.toString())
      , name    : topic.name
      , user_id : topic.user_id
      , stats   : topic.stats
      })
    }

    res.send(topics)
  }
}


// POST /api/1/:screen_name/topics/sort
controller.sort_topics = function(req, res) {
  var screen_name = req.params.screen_name
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

  db.topics.find({ user_id : user.user_id }, foundTopics)

  function foundTopics(err, _topics) {
    if (err) {
      return sendError(500, err, res)
    }
    var topics = {}
      , l      = _topics.length - 1

    // Sorting topics
    _topics.forEach(function(e, p) {
      topics[e._id] = e
      if (!(l - p)) {
        loopPositions(0)
      }
    })

    function loopPositions(p) {
      var topic = topics[positions[p]]
      topic.position = p
      topic.save(function() {
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


// POST /api/1/topic
// Receives a JSON with the new topic model
controller.create_topic = function(req, res) {
  var user_id = req.body.user_id

  if (user_id !== req.session.user.user_id) {
    // This is not the logged in user
    return res.send('{}')
  }

  db.topics.create(req.body, function(err, topic) {
    if (err) {
      return sendError(500, err, res)
    }
    res.send({
      _id     : app.utils.encrypt(topic._id.toString())
    , name    : topic.name
    , user_id : topic.user_id
    , stats   : topic.stats
    })
  })
}


// DELETE /api/1/:screen_name/topic/:_id
controller.delete_topic = function(req, res) {
  var user        = req.session.user
    , screen_name = user.screen_name
    , user_id     = user.user_id
    , _id         = app.utils.decrypt(req.params._id)

  if (!(user_id && screen_name === req.params.screen_name)) {
    return sendError(401, 'Seems like you\'re not logged in!', res)
  }

  db.topics.remove({
    _id     : _id
  , user_id : user_id
  }, topicRemoved)

  function topicRemoved(err) {
    if (err) {
      return sendError(500, err, res)
    }
    db.notes.remove({ topic_id : _id, user_id : user_id }, notesRemoved)
  }

  function notesRemoved(err) {
    if (err) {
      return sendError(500, err, res)
    }
    // Updating user's stats
    db.users.update({
      user_id : user_id
    }, {
      $inc : { 'stats.topics' : -1 }
    }, done)
  }

  function done(err) {
    if (err) {
      return sendError(500, err, res)
    }
    res.send({})
  }
}


// PUT /api/1/:screen_name/topic/:_id
controller.update_topic = function(req, res) {
  var user        = req.session.user
    , screen_name = user.screen_name
    , user_id     = user.user_id
    , _id         = app.utils.decrypt(req.params._id)
    , topic

  // New values
  var name = req.body.name

  if (!(user_id && screen_name === req.params.screen_name)) {
    return sendError(401, 'Seems like you\'re not logged in!', res)
  }

  db.topics.findOne({
    _id      : _id
  , user_id  : user_id
  }, foundTopic)

  function foundTopic(err, _topic) {
    if (err || !_topic) {
      return sendError(500, err, res)
    }
    topic = _topic
    topic.name = name
    topic.save(done)
  }

  function done(err) {
    if (err) {
      return sendError(500, err, res)
    }
    res.send({
      _id      : app.utils.encrypt(topic._id.toString())
    , name     : topic.name
    , user_id  : topic.user_id
    , stats    : topic.stats
    })
  }
}


// POST /api/1/:screen_name/topic/:_id
controller.email_topic = function(req, res) {
  var user        = req.session.user
    , screen_name = user.screen_name
    , user_id     = user.user_id
    , _id         = app.utils.decrypt(req.params._id)
    , topic
    , notes
    , smtp
    , email = req.body.email
    , time_diff
    , over_time

  if (!(user_id && screen_name === req.params.screen_name)) {
    return sendError(401, 'Seems like you\'re not logged in!', res)
  }

  if (!req.session.emails) {
    // Setting Emails Session
    req.session.emails = {
      updated_at : new Date()
    , sent_mails : 0
    }
  } else {
    time_diff = new Date() - req.session.emails.updated_at
    over_time = time_diff > 60000
    // If the user have sent more than 10 emails in one minute
    if (over_time) {
      if (req.session.emails.sent_mails > 10) {
        return sendError(404, 'You\'ve sent too many emails!', res)
      }
      req.session.emails.sent_mails = 0
    }
  }

  // Setting smtp
  smtp = mailer.createTransport('SMTP', app.secret.smtp)

  db.topics.findOne({
    _id      : _id
  , user_id  : user_id
  }, foundTopic)

  function foundTopic(err, _topic) {
    if (err || !_topic) {
      return sendError(500, err, res)
    }
    topic = _topic
    db.notes.find({ topic_id : topic._id,  user_id : user.user_id }, foundNotes)
  }

  function foundNotes(err, _notes) {
    if (err) {
      return sendError(500, err, res)
    }
    notes = _notes
    var locals = {
      user  : user
    , topic : topic
    , notes : notes.map(function(e) { e.parsed = Markdown.parse(e.text); return e })
    , encrypted_id : req.params._id
    }
    fs.readFile(__dirname + '/../../views/email.jade', 'utf-8', function(err, data) {
      if (err) {
        return sendError(500, err, res)
      }
      sendMail(jade.compile(data.toString('utf-8'))(locals))
    })
  }

  function sendMail(html) {
    var mail_options = {
      from    : 'Topics ' + app.secret.smtp.auth.user
    , to      : email
    , subject : '"' + topic.name + '"'
    , html    : html
    }
    smtp.sendMail(mail_options, done)
  }

  function done(err) {
    if (err) {
      return sendError(500, err, res)
    }
    req.session.emails.sent_mails += 1
    res.send({
      status : 'ok'
    })
  }
}
