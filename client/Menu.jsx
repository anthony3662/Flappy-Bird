import React from 'react';
import axios from 'axios';
import spriteLibrary from './sprites.js';
import Selection from './Selection.jsx';
import InstructionModal from './InstructionModal.jsx';

export default class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.toggleLeaderboard = this.toggleLeaderboard.bind(this);
    this.pullLeaderboard = this.pullLeaderboard.bind(this);
    this.sendScore = this.sendScore.bind(this);
    this.toggleImage = this.toggleImage.bind(this);
    this.toggleUpload = this.toggleUpload.bind(this);
    this.loadFile = this.loadFile.bind(this);
    this.loadURL = this.loadURL.bind(this);
    this.clearUpload = this.clearUpload.bind(this);
    this.cancelUpload = this.cancelUpload.bind(this);
    this.saveBird = this.saveBird.bind(this);

    this.state = {
      imageIndex: 0,
      leaderboard: false,
      addingBird: false,
      sendEnabled: true,
      validationMessage: false,
      noNameMessage: false,
      users: [],
      scores: [],

      filesLoaded: 0,
    };
  }

  componentDidMount() {
    this.pullLeaderboard();
    this.toggleImage();
  }

  componentWillUnmount() {
    clearTimeout(this.ticker);
  }

  toggleImage() { //toggles between the two versions of the selected bird
    this.ticker = setTimeout(this.toggleImage, 600);
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
    });
  }

  toggleUpload() {
    if (parseInt(window.localStorage.getItem('highScore')) >= 50) {
      this.setState({
        addingBird: !this.state.addingBird
      });
    }
  }

  loadFile(e) {
    if (this.state.filesLoaded >= 2) {
      return;
    }
    var image = document.getElementById('' + this.state.filesLoaded);
    image.src = URL.createObjectURL(e.target.files[0]);
    this.setState({
      filesLoaded: this.state.filesLoaded + 1
    });
  }

  loadURL() {
    if (this.state.filesLoaded >= 2 || document.getElementById('uploadURL').value.length === 0) {
      return;
    }
    var image = document.getElementById('' + this.state.filesLoaded);
    image.src = document.getElementById('uploadURL').value;
    document.getElementById('uploadURL').value = '';
    this.setState({
      filesLoaded: this.state.filesLoaded + 1
    });
  }

  clearUpload() {
    var image0 = document.getElementById('0');
    var image1 = document.getElementById('1');
    image0.removeAttribute('src');
    image1.removeAttribute('src');
    this.setState({
      filesLoaded: 0,
      noNameMessage: false
    });
  }

  cancelUpload() {
    this.clearUpload();
    this.toggleUpload();
  }

  saveBird() {
    var name = document.getElementById('newName').value;
    if (name.length === 0) {
      this.setState({
        noNameMessage: true
      });
      return;
    }
    spriteLibrary[name] = {};
    spriteLibrary[name]['0'] = document.getElementById('0').src;
    spriteLibrary[name]['1'] = document.getElementById('1').src;
    this.props.addCustom(name);
    this.props.setBird(name);
    this.cancelUpload();

  }

  render () {
    var highScore = parseInt(window.localStorage.getItem('highScore'));
    return (
      <React.Fragment>
        <InstructionModal />
        <div id="menu">
          <h1 id="gameTitle">Flappy Bird</h1>
          <img id="menuBird" src={spriteLibrary[this.props.currentBird][this.state.imageIndex]}/>
          <h2 id={this.props.newBest ? "newBest" : "best"}>{this.props.newBest ? `New Best! ${highScore}` : `Best Score: ${highScore}`}</h2>
          {!this.state.leaderboard &&
            <React.Fragment>
              {!this.state.addingBird &&
                <React.Fragment>
                  <button className="bigButton" onClick={this.props.startGame}>Start Game</button>
                  <button className="bigButton" onClick={this.toggleLeaderboard}>Leaderboard</button>
                  <h3 className="smallHeader">Choose Bird</h3>
                  {this.props.userBird.length > 0 &&
                    <p id="addedMessage">Custom bird added!</p>
                  }
                  <Selection bird={'classic'} scoreRequired={0} score={highScore} setBird={this.props.setBird}/>
                  <Selection bird={'nyan'} scoreRequired={5} score={highScore} setBird={this.props.setBird}/>
                  <Selection bird={'wallstreetbets'} scoreRequired={10} score={highScore} setBird={this.props.setBird}/>
                  <Selection bird={'taylorcorn'} scoreRequired={25} score={highScore} setBird={this.props.setBird}/>
                  {this.props.userBird.length > 0 &&
                    <Selection bird={this.props.userBird} scoreRequired={0} score={highScore} setBird={this.props.setBird}/>
                  }
                  <button id="addBird" onClick={this.toggleUpload}>{highScore >= 50 ? 'Add your own bird' : 'Add your own bird 50 score required'}</button>
                </React.Fragment>
              }
              {this.state.addingBird &&
                <React.Fragment>
                  <h3 className="smallHeader" id="uploadHeader">Upload Bird</h3>
                  <div id="uploadRow">
                    <img className="uploadedImage" id="0"/>
                    <img className="uploadedImage" id="1"/>
                  </div>
                  <p className="fileInstruction">Congrats on unlocking this!</p>
                  <p className="fileInstruction">1st image for jumping</p>
                  <p className="fileInstruction">2nd image for falling!</p>
                  <input id="fileButton" name="fileButton" type="file" accept="image/*" onChange={this.loadFile}/>
                  <div id="urlRow">
                    <button onClick={this.loadURL}>Upload URL</button>
                    <input id="uploadURL" type="text" placeholder="Image URL"/>
                  </div>
                  <input id="newName" type="text" placeholder="Name Your Bird"/>
                  <div id="confirmationRow">
                    <button className="confButton" onClick={this.clearUpload}>Clear</button>
                    <button className="confButton" onClick={this.cancelUpload}>Cancel</button>
                    {this.state.filesLoaded === 2 &&
                      <button class="confButton" onClick={this.saveBird}>Save</button>
                    }
                  </div>
                  {this.state.noNameMessage &&
                    <p className="validationMessage">Please name your bird.</p>
                  }
                </React.Fragment>
              }
            </React.Fragment>
          }
          {this.state.leaderboard &&
            <React.Fragment>
              <p id="backButton" onClick={this.toggleLeaderboard}>Back to Bird Selection</p>
              <h3 className="smallHeader">Leaderboard</h3>
              <div id="leaderboardContainer">
                <div className="column">
                  {this.state.users.map(user => <p className="record">{user}</p>)}
                </div>
                <div className="column" id="rightColumn">
                  {this.state.scores.map(score => <p className="record">{score}</p>)}
                </div>
              </div>
              <div id="formContainer">
                <input id="textbox" placeholder="Nickname"/>
                <button id="sendButton" onClick={this.sendScore}>{this.state.sendEnabled ? 'Send Best Score' : 'Score Sent'}</button>
              </div>
              {this.state.validationMessage &&
                <p className="validationMessage">Username cannot be blank</p>
              }
            </React.Fragment>
          }
        </div>
      </React.Fragment>
    );
  }
}