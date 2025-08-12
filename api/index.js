const jsonServer = require('json-server');
const path = require('path');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, '..', 'db.json'));
const middlewares = jsonServer.defaults();

server.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

server.use(middlewares);
server.use(router);

module.exports = (req, res) => {
  server(req, res);
};