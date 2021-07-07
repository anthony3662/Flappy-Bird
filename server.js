const Score = require('./database/score.js');
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', express.static(__dirname + "/public"));

app.get('/leaders', (req, res) => {
  // var leaders = [
  //   {user: 'winner', score: 50},
  //   {user: 'second', score: 30},
  //   {user: 'third', score: 20}
  // ];
  Score.getTop()
  .then((results) => {
    res.json(results);
  })
  .catch((err) => {
    console.err(err);
    res.sendStatus(500);
  });
});

app.post('/leaders', (req, res) => {
  Score.add(req.body)
  .then(() => {
    res.sendStatus(201);
  })
  .catch((err) => {
    res.sendStatus(500);
  });
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
