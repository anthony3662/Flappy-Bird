import React from 'react';
import axios from 'axios';
import spriteLibrary from './sprites.js';
import Selection from './Selection.jsx';

export default class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.toggleLeaderboard = this.toggleLeaderboard.bind(this);
    this.pullLeaderboard = this.pullLeaderboard.bind(this);
    this.sendScore = this.sendScore.bind(this);
    this.toggleImage = this.toggleImage.bind(this);

    this.state = {
      imageIndex: 0,
      leaderboard: false,
      sendEnabled: true,
      validationMessage: false,
      users: [],
      scores: []
    };
  }

  componentDidMount() {
    this.pullLeaderboard();
    this.toggleImage();
  }

  toggleImage() { //toggles between the two versions of the selected bird
    setTimeout(this.toggleImage, 600);
    this.setState({
      imageIndex: this.state.imageIndex === 0 ? 1 : 0
    });
  }

  toggleLeaderboard() {
    this.setState({
      leaderboard: !this.state.leaderboard
    });
  }

  pullLeaderboard() {
    axios.get('/leaders')
    .then((response) => {
      var arr = response.data;
      var users = [];
      var scores = [];
      for (var i = 0; i < arr.length; i++) {
        users.push(arr[i].user);
        scores.push(arr[i].score);
      }
      this.setState({
        users: users,
        scores: scores
      });
    })
    .catch((err) => {
      console.err(err);
    });
  }

  sendScore() {
    var nickname = document.getElementById('textbox').value;
    if (nickname.length === 0) {
      this.setState({
        validationMessage: true
      });
      return;
    }
    var button = document.getElementById('sendButton');
    button.disabled = true;
    this.setState({
      sendEnabled: false
    });
    axios.post('/leaders', {
      user: nickname.slice(0, 10),
      score: parseInt(window.localStorage.getItem('highScore'))
    })
    .then(() => {
      this.pullLeaderboard();
      // alert('score sent');
    })
    .catch((err) => {
      console.err(err);
    })
  }

  render () {
    var highScore = parseInt(window.localStorage.getItem('highScore'));
    return (
      <div id="menu">
        <h1 id="gameTitle">Flappy Bird</h1>
        <img id="menuBird" src={spriteLibrary[this.props.currentBird][this.state.imageIndex]}/>
        <h2 id="best">{`Best Score: ${highScore}`}</h2>
        {!this.state.leaderboard &&
          <React.Fragment>
            <button class="bigButton" onClick={this.props.startGame}>Start Game</button>
            <button class="bigButton" onClick={this.toggleLeaderboard}>Leaderboard</button>
            <h3 class="smallHeader">Choose Bird</h3>
            <Selection bird={'classic'} scoreRequired={0} score={highScore} setBird={this.props.setBird}/>
            <Selection bird={'nyan'} scoreRequired={5} score={highScore} setBird={this.props.setBird}/>
            <Selection bird={'wallstreetbets'} scoreRequired={10} score={highScore} setBird={this.props.setBird}/>
            <Selection bird={'taylorcorn'} scoreRequired={50} score={highScore} setBird={this.props.setBird}/>
          </React.Fragment>
        }
        {this.state.leaderboard &&
          <React.Fragment>
            <p id="backButton" onClick={this.toggleLeaderboard}>Back to Bird Selection</p>
            <h3 class="smallHeader">Leaderboard</h3>
            <div id="leaderboardContainer">
              <div class="column">
                {this.state.users.map(user => <p class="record">{user}</p>)}
              </div>
              <div class="column" id="rightColumn">
                {this.state.scores.map(score => <p class="record">{score}</p>)}
              </div>
            </div>
            <div id="formContainer">
              <input id="textbox" placeholder="Nickname"/>
              <button id="sendButton" onClick={this.sendScore}>{this.state.sendEnabled ? 'Send Best Score' : 'Score Sent'}</button>
            </div>
            {this.state.validationMessage &&
              <p id="validationMessage">Username cannot be blank</p>
            }
          </React.Fragment>
        }
      </div>
    );
  }
}