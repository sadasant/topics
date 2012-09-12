// topics
// by Daniel Rodríguez
// MIT Licensed

// app.js
// ======
//
// The bootloader of topics server provider.
//
// The Dependencies include:
//
// -   [Express.js](http://expressjs.com/):
//     A nice web application framework for node.
//
// -   [http](http://nodemanual.org/0.8.6/nodejs_ref_guide/http.html):
//     The new Express.js has less syntax sugar,
//     the server itself is created by the _http_
//     module.
//
//         Reference: https://github.com/visionmedia/express/wiki/Migrating-from-2.x-to-3.x
//
// -   [oauth](https://github.com/ciaranj/node-oauth):
//     OAuth wrapper for node.js
//     We use it to connect with twitter.
//
// -   [mongoose](http://mongoosejs.com/):
//     A good mongodb object model for node.js
//
// -   [stylus](http://learnboost.github.com/stylus/):
//     A language that compiles in css,
//     far more confortable than css.
//
// -   [nib](http://visionmedia.github.com/nib/):
//     CSS3 extensions for stylus.
//
// -   [Markdown](https://github.com/evilstreak/markdown-js):
//     A javascript markdown parser, used for the notes.
//
// -   **secret**:
//     The secret file is a module that stores all
//     the private information needed to run the
//     application. You can read more in the
//     example_secrets.js file at the root directory.
//
// -   **utils**:
//     Our utils module, storing some functions
//     useful across the site.
//

const express  = require('express')
    , http     = require('http')
    , OAuth    = require('oauth').OAuth
    , mongoose = require('mongoose')
    , stylus   = require('stylus')
    , nib      = require('nib')
    , Markdown = require('markdown')
    , secret   = require('./secret')
    , utils    = require('./app/utils')(secret)

var app      = {}
  , app_name = 'topics'
  , port     = process.env.app_port || process.env.PORT || 5000
  , server   = express()
  , db       = mongoose.createConnection(secret.mongo_url)
  , oa

  // Little hack to test minified files locally
  , publ = process.env.app_port || process.env.PORT ? 'production' : 'public'


oa = new OAuth(
     'https://api.twitter.com/oauth/request_token'
   , 'https://api.twitter.com/oauth/access_token'
   , secret.twitter.consumer_key
   , secret.twitter.consumer_secret
   , '1.0'
   , secret.twitter.callback + '/connect/twitter/callback'
   , 'HMAC-SHA1'
   )

// Global Variables
app.oa       = oa
app.server   = server
app.secret   = secret
app.utils    = utils
app.Markdown = Markdown

// Models
mongoose.model('User' , require('./app/models/user' )(app))
mongoose.model('Topic', require('./app/models/topic')(app))
mongoose.model('Note' , require('./app/models/note' )(app))

// Nib compiler
function nibCompile(str, path) {
  return stylus(str)
    .set('filename', path)
    .set('compress', true)
    .use(nib())
}

// Express configuration
server.configure(function() {
  server.use(express.limit('5kb'))
  server.use(express.logger('dev'))
  server.use(express.favicon(__dirname + '/topics.ico'))
  server.use(express.cookieParser())
  server.use(express.session({ secret : secret.session, cookie : { expires : false }}))
  server.use(express.bodyParser())
  server.use(express.methodOverride())
  server.set('views', __dirname + '/views')
  server.set('view engine', 'jade')
  server.use(require('stylus').middleware({ src: __dirname + '/' + publ, compile: nibCompile }))
  server.use(server.router)
  server.use(express.static(__dirname + '/' + publ))
  server.use(express.errorHandler())
  server.set('port', port)
  server.set('db', {
    main   : db
  , users  : db.model('User')
  , topics : db.model('Topic')
  , notes  : db.model('Note')
  })
})

server.configure('development', function() {
  server.use(express.errorHandler({ dumpExceptions : true, showStack : true }))
})

server.configure('production', function() {
  server.use(express.errorHandler())
})

// Routes
require('./app/routes')(app)

// Starting the server
http.createServer(server).listen(server.get('port'), function(){
  console.log(app_name + ' listening on 127.0.0.1:' + server.get('port'))
})
