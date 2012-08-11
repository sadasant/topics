// topics
// by Daniel Rodríguez
// MIT Licensed

define('NotesView', [
  'jquery'
, 'underscore'
, 'backbone'
, 'text!../templates/note.html'
, 'ConfirmView'
, 'jqueryColor'
], function($, _, B, tpl, ConfirmView) {
  var NotesViewClass
    , noteEvents = {
        'click .del'     : 'remove'
      , 'click .edit'    : 'edit'
      , 'click .cancel'  : 'cancelEdit'
      , 'click .save'    : 'save'
      , 'keyup .editbox' : 'updateCount'
      , 'click img'      : 'openImage'
      }
    , confirmView
    , $loading
    , note_url

  NotesViewClass = B.View.extend({
    initialize : function(params) {
      _(this).bindAll('add')
      if (params.notes_url) {
        note_url = params.notes_url.slice(0, params.notes_url.length - 1)
      }
      if (this.collection) {
        this.collection.bind('add', this.add)
        this.tags = []
        $loading  = $('#loading')
      }
      this.template = _.template(tpl)
    }
  , render : function() {
      var that = this
      $(this.el).html(this.template({ note : this.model.attributes })).fadeIn(0, function() {
        that.$el.find('pre code').each(function(i, e) {
          hljs.highlightBlock(e)
        })
      })
      return this
    }
  , add : function(note) {
      var noteView = new NotesViewClass({ model : note })
        , that = this
      noteView.delegateEvents(noteEvents)
      this.tags[note.attributes._id] = noteView
      $loading.before(noteView.render().el)
      note.id = note.attributes._id
      note.urlRoot = 'api/1/note'
      note.bind('delete', function(callback) {
        that.collection.remove(note)
        note.destroy({
          url     : note_url + '/' + note.attributes._id
        , success : function(){
            callback()
          }
        , error : function(model, res, req) {
            that.$el.find('.load').addClass('error')
            console.log('ERROR', res)
          }
        })
      })
    }
  , renderAll : function() {
      var that = this
      _.each(this.collection.models, function(model) {
        that.add(model)
      })
    }
  , remove : function() {
      var $el  = this.$el
        , that = this
        , text = this.model.attributes.text.replace(/</g, '&lt;')

      if (text.length > 33) {
        text = text.slice(0, 32) + '...'
      }

      confirmView.render({
        text : 'Remove the note "<b>' + text + '</b>"?'
      , yes  : 'Yes!'
      , no   : 'Nope'
      }, function() {
        $el.find('.del').hide()
        $el.find('.load').removeClass('hide')
        that.model.trigger('delete', function() {
          $el.fadeOut(100, function() {
            $el.remove()
          })
        })
      })
    }
  , edit : function() {
      if (!this.$editbox) {
        this.$editbox   = this.$el.find('.editbox')
        this.$text      = this.$el.find('.text')
        this.$del       = this.$el.find('.del')
        this.$edit      = this.$el.find('.edit')
        this.$save      = this.$el.find('.save')
        this.$cancel    = this.$el.find('.cancel')
        this.$count     = this.$el.find('.count')
        this.$countSpan = this.$count.find('span')
        this.updateCount()
      }
      this.cachedText = this.$editbox.val()
      this.$del.addClass('hide')
      this.$edit.addClass('hide')
      this.$text.addClass('hide')
      this.$editbox.removeClass('hide')
      this.$save.removeClass('hide')
      this.$cancel.removeClass('hide')
      this.$count.removeClass('hide')
    }
  , updateCount : function() {
      var length = 2048 - this.$editbox.val().length
      if (length < 0) {
        length = '<span style="color:red">' + length + '</span>'
      }
      this.$countSpan.html(length)
    }
  , cancelEdit : function() {
      // Inserting this.model.attributes.markdown
      // was causing an issue with "<" character.
      this.$editbox.val(this.cachedText)
      this.updateCount()
      this.$del.removeClass('hide')
      this.$edit.removeClass('hide')
      this.$text.removeClass('hide')
      this.$editbox.addClass('hide')
      this.$save.addClass('hide')
      this.$cancel.addClass('hide')
      this.$count.addClass('hide')
    }
  , save : function() {
      var $editbox = this.$el.find('.editbox')
        , $text    = this.$el.find('.text')
        , $save    = this.$el.find('.save')
        , $load    = this.$el.find('.load')
        , text     = $editbox.val()
        , that     = this
      if (!text || text === this.cachedText || text.length > 2048) {
        $editbox
        .css('background-color', '#FCF8D0')
        .animate({
          backgroundColor : '#fff'
        }, 1000)
      } else {
        $save.addClass('hide')
        $load.removeClass('hide')
        this.model.save('text', text, {
          url     : note_url + '/' + this.model.attributes._id
        , success : function() {
            $save.removeClass('hide')
            $load.addClass('hide')
            that.cachedText = text
            $text.html(that.model.get('parsed')).find('pre code').each(function(i, e) {
              hljs.highlightBlock(e)
            })
            that.cancelEdit()
          }
        , error : function(model, res, req) {
            $load.addClass('error')
            console.log('ERROR', res)
          }
        })
      }
    }
  , openImage : function(e) {
      window.open(e.target.src)
    }
  })

  // HACK
  // Sharing a view between views
  NotesViewClass.setConfirmView = function(view) {
    confirmView = view
  }

  return NotesViewClass
})
