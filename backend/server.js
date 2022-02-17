const express = require('express');
const app = express();
const PORT = process.env.SERVER_PORT || 5000;

const localData = require('./database/database.json');
console.log(JSON.stringify(localData));
app.get('/', (req, res) => {
  res.send(JSON.stringify({ message: 'Hello World' }));
});

app.get('/api/', (req, res) => {
  const { firstname, lastname, email } = req.query;
  res.send(JSON.stringify({ firstname, lastname, email }));
  // .redirect('http://localhost:3030/');
});
app.get('/videos/latest/', (req, res) => {
  console.log(req.param);
  // query data from database
  res.send(JSON.stringify(localData));
});
app.get('/videos/features/', (req, res) => {
  // query data from database
  res.send(JSON.stringify(localData));
});
app.get('/videos/spotlight/', (req, res) => {
  // query data from database
  res.send(JSON.stringify(localData));
});
app.get('/videos/all/', (req, res) => {
  // query data from database
  res.send(JSON.stringify(localData));
});
app.post('/videos/edit/post-video', (req, res) => {
  console.log('Request Body:', req.body);
  res.send(JSON.stringify({ message: 'Posted!' }));
});
//:title-:video_link-:created-on
app.listen(PORT, () => console.log(`Server is running at ${PORT}`));
