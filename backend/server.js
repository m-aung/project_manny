const express = require('express');
const app = express();
const PORT = process.env.SERVER_PORT || 8080;

app.get('/', (req, res) =>
  res.send(JSON.stringify({ message: 'Hello World' }))
);

app.get('/api/', (req, res) => {
  const { firstname, lastname, email } = req.query;
  res
    .send(JSON.stringify({ firstname, lastname, email }))
    .redirect('http://localhost:3030/');
});
app.get('/videoList/latest/:datefrom', (req, res) => {
  console.log(req.param);

  // query data from database
  res.send(JSON.stringify(data));
});

app.listen(PORT, () => console.log(`Server is running at ${PORT}`));
