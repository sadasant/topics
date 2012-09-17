// topics
// by Daniel Rodríguez
// MIT Licensed

define('TopicModel', ['backbone'], function(B) {
  var Topic

  Topic = B.Model.extend({
    urlRoot     : 'api/1/topic'
  , idAttribute : '_id'
  , defaults    : {
      name      : ''
    , user_id   : ''
    , stats     : {
        notes   : 0
      , visits  : 0
      }
    }
  , validate : function(topic) {

      if (!topic.name || topic.name.length > 140) {
        return 'Invalid Topic Name'
      }
      if (!topic.user_id) {
        return 'Invalid User ID'
      }

    }
  })

  return Topic
})
