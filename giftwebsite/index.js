/*jshint esversion: 8 */
const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 9000;

// Serve the React production build (copied here by `npm run build` in giftlink-frontend)
app.use(express.static(path.join(__dirname, 'build')));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.get('/app', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Client-side routes such as /app/login or /app/product/:id
app.get('/app/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`GiftLink website running on port ${port}`);
});
