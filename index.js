const path = require('path');
const express = require('express');

const SERVER = {
  app: express(),
  port: process.env.PORT || 3000,
  static: function(req, res) {
    console.log('dirname', __dirname);
    res.sendFile('/build/index.html');
  }
};

// Webserver
SERVER.app.use(express.static(path.join(__dirname, 'build')));
SERVER.app.get('/*', SERVER.static);

// Start server
SERVER.app.listen(SERVER.port, () => {
  console.log(`Server running on port ${SERVER.port}`);
});
