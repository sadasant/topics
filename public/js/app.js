// topics
// by Daniel Rodríguez
// MIT Licensed

define('app', [
  'backbone'
, 'router'
], function(B, Router) {

  // Initializing the Router
  // and the History API
  function init(router) {
    router = new Router()
    B.history.start()
  }

  return {
    init      : init
  }

})
