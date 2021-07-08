const mongoose = require('./index.js');

const scoreSchema = mongoose.Schema({
  user: String,
  score: Number
});

let Score = mongoose.model('Score', scoreSchema, 'scores');

let getTop = () => {
  return Score.find({}).sort('-score').limit(5);
};

let add = (entry) => {
  var newScore = new Score(entry);
  return newScore.save()
};

module.exports.getTop = getTop;
module.exports.add = add;