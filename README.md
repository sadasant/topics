# topics

**topics** is a web application for creating notes by a given topic. It's purpose is to give you a simple, beautiful and fully interactive environment where you can inquire about your favourite things, begin summaries of life events, take annotations from books, classes or any other subject. Access it anywhere with your twitter account, and share your ideas over social networks!

**Read more and test it live here: [http://topics.sadasant.com/sadasant/topic...](http://topics.sadasant.com/sadasant/topic/CODIMOS).**

## Some details

**topics** is an spare-time project made by Daniel Rodríguez [@sadasant](https://mobile.twitter.co/sadasant) for fun and knowledge. It is built entirely in *JavaScript*, with Open Source frameworks and libraries such as [NodeJS](http://nodejs.org/), [jQuery](http://jquery.com/), [Backbone](http://documentcloud.github.com/backbone/), [Underscore](documentcloud.github.com/underscore/), [RequireJS](http://requirejs.org/), [Express](http://expressjs.com/), [Jade](https://github.com/visionmedia/jade), [Stylus](http://learnboost.github.com/stylus/), [Mongodb](http://mongodb.org/) and more!

## How to run it

- Run `npm install`.

- Run it locally with `node app`.

- Or test a production-like behavior with `foreman start`.

What changes between the both states is that foreman stablish a environment variable with the port, which I use to switch from using
the `public/` route for static files, to the `production/` folder, which has all the optimized AMD resources.

## JavaScript flavor

I'm using [this](https://github.com/sadasant/dotfiles/blob/master/.jshintrc) .jshintrc :)

## Rebuild the public/ source

- Install RequireJS with node: `npm install -g requirejs`

- Go to the public folder and run `r.js -o app.build.js`.

- If you want to make just CSS updates, you can run `cp css/style.styl ../production/css/style.styl`.

If you're interested on learning about RequireJS optimization,
I recommend you to go to the official documentation: <http://requirejs.org/docs/optimization.html>

## Wikis

It will have a full wiki. (Wait for it)

## License

Copyright 2012 Daniel Rodríguez
http://sadasant.com/

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
