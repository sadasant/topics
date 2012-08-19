// topics
// by Daniel Rodríguez
// MIT Licensed

define('HomeView', [
  'underscore'
, 'backbone'
, 'text!../templates/home.html'
//, 'text!/templates/home.html'
], function(_, B, tpl) {
  var HomeView

  HomeView = B.View.extend({
    el         : '#box'
  , initialize : function() {
      this.$welcome = this.$el.find('#welcome')
      this.template = _.template(tpl)
    }
  , render : function(locals) {
      var $el = this.$el
      $el.hide().html(this.template(locals)).fadeIn(500)
    }
  , remove : function(callback) {
      var $el      = this.$el
        , $welcome = this.$welcome
      $el.fadeOut(500, function() {
        $welcome.remove()
        $el.show()
        if (typeof callback === 'function') {
          callback()
        }
      })
    }
  })

  return HomeView
})
