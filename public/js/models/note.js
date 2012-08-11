// topics
// by Daniel Rodríguez
// MIT Licensed

define('NoteModel', [
  'jquery'
, 'underscore'
, 'backbone'
], function($, _, B) {
  var Note

  Note = B.Model.extend({
    urlRoot     : 'api/1/note'
  , idAttribute : '_id'
  , defaults    : {
      text      : ''
    , user_id   : ''
    , topic_id  : ''
    }
  , validate : function(note) {

      if (!note.text || note.text.length > 2024) {
        return 'Invalid Note Text'
      }
      if (!note.user_id) {
        return 'Invalid User ID'
      }
      if (!note.topic_id) {
        return 'Invalid Topic ID'
      }

    }
  })

  return Note
})
