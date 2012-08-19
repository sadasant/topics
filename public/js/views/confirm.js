// topics
// by Daniel Rodríguez
// MIT Licensed

define('ConfirmView', [
  'jquery'
, 'backbone'
, 'text!../templates/confirm.html'
], function($, B, tpl) {
  var ConfirmView

  ConfirmView = B.View.extend({
    initialize : function() {
      this.$el = $(tpl)
      this.el  = this.$el[0]
      $(document.body).append(this.$el)
      this.$text = this.$el.find('.text')
      this.$yes  = this.$el.find('.yes')
      this.$no   = this.$el.find('.no')
    }
  , events : {
      'click .yes' : 'yes'
    , 'click .no'  : 'no'
    }
  , render : function(args, callback) {
      this.callback = callback
      this.$text.html(args.text)
      this.$yes.html(args.yes)
      this.$no.html(args.no)
      this.$el.fadeIn(500)
    }
  , yes : function() {
      if (typeof this.callback === 'function') {
        this.callback()
      }
      this.$el.fadeOut(500)
    }
  , no : function() {
      this.$el.fadeOut(500)
    }
  })

  return ConfirmView
})
