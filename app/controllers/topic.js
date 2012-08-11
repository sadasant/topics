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
  Markdown  = app.Markdown
  sendError = app.utils.sendError
  return controller
}


// GET /api/1/:screen_name/topic/:_id
controller.get_topic = function(req, res) {
  var topic_id    = app.utils.decrypt(req.params._id)
    , screen_name = req.params.screen_name
    , user        = req.session.user

  if (!topic_id || screen_name !== user.screen_name) {
    // This is not the logged in user
    return res.send('{}')
  }

  db.topics.findOne({ _id : topic_id,  user_id : user.user_id }, foundTopic)

  function foundTopic(err, _topic) {
    if (err) return sendError(500, err, res)

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
    if (err) return sendError(500, err, res)
    var topics = []
      , topic
      , i = 0
      , l = _topics.length

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


// POST /api/1/topic
// Receives a JSON with the new topic model
controller.create_topic = function(req, res) {
  var user_id = req.body.user_id

  if (user_id !== req.session.user.user_id) {
    // This is not the logged in user
    return res.send('{}')
  }

  db.topics.create(req.body, function(err, topic) {
    if (err) return sendError(500, err, res)
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
    if (err) return sendError(500, err, res)

    db.notes.remove({ topic_id : _id, user_id : user_id }, notesRemoved)
  }

  function notesRemoved(err) {
    if (err) return sendError(500, err, res)

    // Updating user's stats
    db.users.update({
      user_id : user_id
    }, {
      $inc : { 'stats.topics' : -1 }
    }, done)
  }

  function done(err) {
    if (err) return sendError(500, err, res)
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
    if (err || !_topic) return sendError(500, err, res)
    topic = _topic
    topic.name = name
    topic.save(done)
  }

  function done(err) {
    if (err) return sendError(500, err, res)
    res.send({
      _id      : app.utils.encrypt(topic._id.toString())
    , name     : topic.name
    , user_id  : topic.user_id
    , stats    : topic.stats
    })
  }
}
