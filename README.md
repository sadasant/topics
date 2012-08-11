# topics.herokuapp.com

**topics** is a web application for creating notes by a given topic,
it's intended to work for creating summaries of life events, books,
classes or any learning subject, accessible from any device using
your twitter account, and sharables over social networks.

## How to run it

- Run `npm install`.

- Run it locally with `node app`.

- Or test a production-like behavior with `foreman start`.

What changes between the both states is that foreman stablish a environment variable with the port, which I use to switch from using
the `public/` route for static files, to the `production/` folder, which has all the optimized AMD resources.

## How to recompile the Client Side JavaScript source

- Install RequireJS with node: `npm install -g requirejs`

- Go to the public folder and run `r.js -o app.build.js`.

- If you want to make just CSS updates, you can run `cp css/style.styl ../production/css/style.styl`.

If you're interested on learning about RequireJS optimization,
I recommend you to go to the official documentation: <http://requirejs.org/docs/optimization.html>

# Wikis

It will have a full wiki. (Wait for it)

# License

MIT Licensed
