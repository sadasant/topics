// topics
// by Daniel Rodríguez
// MIT Licensed

define('FullTopicView', [
  'jquery'
, 'underscore'
, 'backbone'
, 'NotesView'
, 'NoteModel'
, 'text!../templates/fullTopic.html'
], function($, _, B, NotesView, NoteModel, tpl) {

  var FullTopicView
    , confirmView
    , $newNoteText
    , $newNote
    , $newCountSpan
    , $loading
    , notes_url
    , topic_url
    , tips = [
      'Read the Markdown documentation to make beautiful notes!<br/><a href="http://daringfireball.net/projects/markdown/">http://daringfireball.net/pro...</a>'
    , 'Remember to read the description of this project:<br/><a href="http://topics.sadasant.com/sadasant/topic/89bfef93da3549baface0b8aa34fe63578b8ddd70eee79dcd3910ecd57ce9b0c">http://topics.sadasant.com/sadasant/topic...</a>'
    , 'Are you having an issue? Write us in our github repo:<br/><a href="https://github.com/sadasant/topics/issues">https://github.com/sadasant/top...</a>'
    , , , // Sometimes don't display tips
    ]

  function createNoteView(that) {
    that.$notes      = that.$el.find('#notes')
    if (that.$notes[0]) {
      that.notes     = new B.Collection()
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

  function setSortableNotes(that) {
    var notes   = that.notes
      , $notes = $('ul#notes')
      , busy_sort = false
    function checkIfBusy() {
      if (busy_sort) {
        $notes.sortable('destroy')
      }
    }
    function updateSortedNotes(e, ui) {
      var $lis    = $notes.find('li.note')
        , _ids    = [].map.call($lis, function(e){ return e.id.slice(6) })
        , $target = ui.item
        , $del    = $target.find('.del')
        , $load   = $target.find('.load')
      $del.hide()
      $load.removeClass('hide')
      busy_sort = true
      $.post(notes.url + '/sort', { positions : _ids }, function(data) {
        if (data.status === 'ok') {
          busy_sort = false
          $load.addClass('hide')
          $del.show()
        } else {
          $load.addClass('error')
        }
      })
      // notes.sort() ?
    }
    $notes.sortable({
      opacity : 0.8
    , items   : '.note'
    , cursor  : 'move'
    , start   : checkIfBusy
    , update  : updateSortedNotes
    })
  }

  FullTopicView = B.View.extend({
    el         : '#box'
  , initialize : function(params) {
      this.$full     = this.$el.find('#fulltopic')
      this.notes     = new B.Collection()
      this.user      = params.user
      this.topic_id  = params.topic_id
      topic_url      = '/api/1/' + params.user.attributes.screen_name + '/topic/' + params.topic_id
      notes_url      = topic_url + '/notes'
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
    , 'click .sendMail .send'      : 'sendMail'
    }
  , render : function() {
      var $el = this.$el
        , that = this
        , tip_position = (Math.random() * tips.length) >> 0
        , locals = {
            user  : this.user.attributes
          , topic : this.model.attributes
          , tip   : tips[tip_position]
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
                setSortableNotes(that)
              }).addClass('stop')
            }
          , error : function() {
              $loading.addClass('error')
            }
          })
        } else {
          setSortableNotes(that)
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
  , addNote : function() {
      var $field = $newNoteText
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
  , sendMail : function(e) {
      var $sendMail     = $('.sendMail')
        , $send         = $sendMail.find('.send')
        , $load         = $sendMail.find('.load')
        , $input        = $sendMail.find('input')
        , email         = $input.val()
        , validateEmail = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      if (validateEmail.test(email)) {
        $send.hide()
        $load.removeClass('hide')
        $.post(topic_url + '/email', { email : email }, function(data) {
          if (data.status === 'ok') {
            $input.val('')
            $send.show()
            $load.addClass('hide')
          } else {
            $input.css('background-color', '#FCF8D0')
            .animate({
              backgroundColor : '#fff'
            }, 1000)
          }
        })
      } else {
        $input
        .val('')
        .css('background-color', '#FCF8D0')
        .animate({
          backgroundColor : '#fff'
        }, 1000)
      }
    }
  , remove : function(callback) {
      var $el   = this.$el
        , $full = this.$full
      this.undelegateEvents()
      $el.fadeOut(500, function() {
        $full.remove()
        $el.show()
        if (callback) {
          callback()
        }
      })
    }
  })

  // HACK
  // Sharing a view between views
  FullTopicView.setConfirmView = function(view) {
    confirmView = view
    NotesView.setConfirmView(confirmView)
  }

  return FullTopicView
})
