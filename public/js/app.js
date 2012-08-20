// topics
// by Daniel Rodríguez <http://sadasant.com/>
// MIT Licensed

// app.js
// ======
//
// The bootloader of the topics web client.
//
// At first, backbone needs to initialize the application's
// router in order to bind any redirections, and it's history
// mode so it can navigate through the current url.
//
// Inside the router all the views and models are triggered.
//

define('app', [
  'backbone'
, 'router'
], function(B, Router) {

  function init(router) {
    router = new Router()
    B.history.start()
  }

  return {
    init : init
  }

})
