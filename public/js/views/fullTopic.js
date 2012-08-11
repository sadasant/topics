// topics
// by Daniel Rodríguez
// MIT Licensed

define('fullTopicView', [
  'jquery'
, 'underscore'
, 'backbone'
, 'NotesView'
, 'NoteModel'
, 'text!../templates/fullTopic.html'
, 'jqueryColor'
], function($, _, B, NotesView, NoteModel, tpl) {
  var fullTopicView
    , confirmView
    , $newNote
    , $newCountSpan
    , $loading
    , notes_url

  function createNoteView(that) {
    that.$notes      = that.$el.find('#notes')
    if (that.$notes[0]) {
      that.notes     = new B.Collection
      that.notes.url = notes_url
      that.noteView  = new NotesView({
        collection : that.notes
      , el         : that.$notes[0]
      , notes_url  : notes_url
      })
    } else {
      delete that.$notes
    }
    return that
  }

  fullTopicView = B.View.extend({
    el         : '#box'
  , initialize : function(params) {
      var $JSONnotes = $('#JSONnotes')
        , JSONnotes
        , that       = this
      this.$full     = this.$el.find('#fulltopic')
      this.notes     = new B.Collection
      this.user      = params.user
      this.topic_id  = params.topic_id
      notes_url      = '/api/1/' + params.user.attributes.screen_name + '/topic/' + params.topic_id + '/notes'
      this.notes.url = notes_url
      // Downloading the templates only if they're needed
      this.template  = _.template(tpl)
      $loading = $('#loading')
      $newNote = $('.newNote')
    }
  , events : {
      'click .topicname .edit'     : 'editTopicName'
    , 'keyup .topicname .editname' : 'updateCount'
    , 'click .topicname .cancel'   : 'cancelEdit'
    , 'click .topicname .save'     : 'saveTopic'
    , 'click .topicname .del'      : 'delTopic'
    , 'keyup .newNote .text'       : 'updateNewNoteCount'
    , 'click .newNote .new'        : 'addNote'
    , 'click #header .title .back' : 'back'
    , 'click #header .user .bye'   : 'logout'
    , 'click .note .text'          : 'showNote'
    }
  , render : function(callback) {
      var $el = this.$el
        , that = this
        , locals = {
            user  : this.user.attributes
          , topic : this.model.attributes
          }
      $el.hide().html(this.template(locals)).fadeIn(500, function() {
        $loading        = $('#loading')
        $newNote        = $('.newNote')
        that.$topicname = that.$el.find('.topicname')
        that.$editname  = that.$topicname.find('.editname')
        that.$h2        = that.$topicname.find('h2')
        that.$del       = that.$topicname.find('.del')
        that.$edit      = that.$topicname.find('.edit')
        that.$save      = that.$topicname.find('.save')
        that.$cancel    = that.$topicname.find('.cancel')
        that.$load      = that.$topicname.find('.load')
        that.$count     = that.$topicname.find('.count')
        that.$countSpan = that.$count.find('span')
        $newCountSpan   = $newNote.find('.count span')
        $newNoteText    = $newNote.find('.text')
        that.updateCount()
        if (!that.$full[0]) {
          that.$full = that.$el.find('#fulltopic')
        }
        if (!that.$notes) {
          createNoteView(that).notes.fetch({
            success : function() {
              // Adding notes once tey're fetched
              $loading.fadeOut(500, function() {
                that.noteView.renderAll()
              }).addClass('stop')
            }
          , error : function() {
              $loading.addClass('error')
            }
          })
        }
      })
    }
  , editTopicName : function() {
      this.cachedName = this.$editname.val()
      this.$h2.addClass('hide')
      this.$del.addClass('hide')
      this.$edit.addClass('hide')
      this.$editname.removeClass('hide')
      this.$save.removeClass('hide')
      this.$cancel.removeClass('hide')
      this.$count.removeClass('hide')
    }
  , updateCount : function() {
      var length = 140 - this.$editname.val().length
      if (length < 0) {
        length = '<span style="color:red">' + length + '</span>'
      }
      this.$countSpan.html(length)
    }
  , cancelEdit : function() {
      this.$editname.val(this.cachedName)
      this.updateCount()
      this.$h2.removeClass('hide')
      this.$del.removeClass('hide')
      this.$edit.removeClass('hide')
      this.$editname.addClass('hide')
      this.$save.addClass('hide')
      this.$cancel.addClass('hide')
      this.$count.addClass('hide')
    }
  , saveTopic : function() {
      var name = this.$editname.val()
        , that = this

      if (!name || name === this.cachedName || name.length > 140) {
        this.$editname
        .css('background-color', '#FCF8D0')
        .animate({
          backgroundColor : '#fff'
        }, 1000)
      } else {
        this.$save.addClass('hide')
        this.$load.removeClass('hide')
        this.model.save('name', name, {
          url     : 'api/1/' + that.user.attributes.screen_name + '/topic/' + that.model.attributes._id
        , success : function() {
            that.$save.removeClass('hide')
            that.$load.addClass('hide')
            that.$count.addClass('hide')
            that.$h2.html(name)
            that.cachedName = name
            that.cancelEdit()
          }
        , error : function() {
            that.$load.addClass('error')
          }
        })
      }
    }
  , delTopic : function() {
      var name = this.model.attributes.name.replace(/</g, '&lt;')
        , that = this

      if (name.length > 33) {
        name = name.slice(0, 32) + '...'
      }

      confirmView.render({
        text : 'Remove the topic "<b>' + name + '</b>"?'
      , yes  : 'Yes!'
      , no   : 'Nope'
      }, function() {
        that.$del.addClass('hide')
        that.$load.removeClass('hide')
        that.model.destroy({
          url     : 'api/1/' + that.user.attributes.screen_name + '/topic/' + that.model.attributes._id
        , success : function() {
            window.location.hash = ''
          }
        , error : function() {
            that.$load.addClass('error')
          }
        })
      })
    }
  , updateNewNoteCount : function() {
      var length = 2048 - $newNoteText.val().length
      if (length < 0) {
        length = '<span style="color:red">' + length + '</span>'
      }
      $newCountSpan.html(length)
    }
  , addNote : function(e) {
      var $el    = this.$el
        , $field = $newNoteText
        , $load  = $newNote.find('.load')
        , $new   = $newNote.find('.new')
        , note   = $.trim($field.val())
        , notes  = this.notes
        , that   = this
        , newNote
      if (!note || note.length > 2048) {
        $field
        .css('background-color', '#FCF8D0')
        .animate({
          backgroundColor : '#fff'
        }, 1000)
      } else {
        $new.hide()
        $load.removeClass('hide')
        $field.val('')
        this.updateNewNoteCount()
        newNote = new NoteModel({
          text     : note
        , user_id  : this.model.attributes.user_id
        , topic_id : this.topic_id
        })
        newNote.save({ wait : true })
        // To delete the note, it must remember it's auther username somehow
        newNote.user_screen_name = this.model.attributes.user_screen_name
        newNote.on('change', function() {
          if (!that.$notes[0]) {
            that.$notes = that.$el.find('#notes')
            that.noteView.$el = that.$notes
            that.noteView.el  = that.$notes[0]
          }
          notes.add(newNote)
          $load.addClass('hide')
          $new.show()
        })
        // TODO:
        // As it's an new note
        // it doesn't trigger any error
        // if the model it's unvalid...
        // Or at least I don't know yet
        // how to trigger that error xD
      }
    }
  , back : function() {
      window.location.href = '#'
    }
  , logout : function(e) {
      e.preventDefault()
      // Make this a view?
      confirmView.render({
        text : 'Are you leaving now?'
      , yes  : 'Yes!'
      , no   : 'Nope'
      }, function() {
        window.location.hash = 'logout'
      })
    }
  , remove : function(callback) {
      var $el   = this.$el
        , $full = this.$full
        , that  = this
      this.undelegateEvents()
      $el.fadeOut(500, function() {
        $full.remove()
        $el.show()
        callback && callback()
      })
    }
  , showNote : function(e) {
    }
  })

  // HACK
  // Sharing a view between views
  fullTopicView.setConfirmView = function(view) {
    confirmView = view
    NotesView.setConfirmView(confirmView)
  }

  return fullTopicView
})
