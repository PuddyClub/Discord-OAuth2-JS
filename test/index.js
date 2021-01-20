// Test Modules Prepare
const discordAuth = require('../index');
const express = require('express');
const app = express();

// Port
const port = 3000

// Path
app.get('/', (req, res) => {
  res.send('Hello World!')
});

// Listen the Server
app.listen(port, () => {
  console.log(`Discord Code Test is being executed in http://localhost:${port}`);
})