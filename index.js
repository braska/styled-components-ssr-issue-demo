const NODE_ENV = process.env.NODE_ENV || 'development';

const express = require('express');
const path = require('path');

const createRenderer = (render, manifest) => (req, res) => {
    const { content, sheet } = render();
    res.render('index', {
      content,
      styles: sheet.getStyleTags(),
      assets: manifest,
    });
};

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

if (NODE_ENV === 'development') {
  const webpack = require('webpack');
  const webpackIsomorphicDevMiddleware = require('webpack-isomorphic-dev-middleware');
  const webpackConfig = require('./webpack.config');
  const compiler = webpack(webpackConfig);
  app.use(webpackIsomorphicDevMiddleware(compiler));
  app.use(require('webpack-hot-middleware')(compiler.compilers.find(c => c.name === 'client')));
  app.use((req, res, next) => {
    const render = res.locals.isomorphicCompilation.exports.default;
    const manifest = JSON.parse(compiler.compilers.find(c => c.name === 'client').outputFileSystem.readFileSync(path.join(__dirname, 'dist', 'client', 'manifest.json'), 'utf8'));
    createRenderer(render, manifest)(req, res, next);
  });
} else {
  const render = require('./dist/server/render').default;
  const manifest = require('./dist/client/manifest.json');
  app.use(createRenderer(render, manifest));
  app.use(express.static(path.join(__dirname, 'dist', 'client')));
}

app.listen(3001);
