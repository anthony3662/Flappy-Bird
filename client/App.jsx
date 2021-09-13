import React from 'react';
import ReactDOM from 'react-dom';
import Pipe from './pipe.jsx';
import Menu from './menu.jsx';

import spriteLibrary from './sprites.js';


//pixels/sec^2
const GRAVITY = 2000;
const FRAME = 30;
const DIAMETER = 50;
const JUMP_V = -600;
const BIRD_OFFSET = 100;
const PIPE_WIDTH = 100;
const PIPE_OPENING = 200;
const PIPE_VELOCITY= 200;

//with these consts, pipe offset between 0 and 150 can cause collision
//pipe should be removed once offset reaches - 100
class App extends React.Component {
  constructor(props) {
    super(props);

    this.randomHexColor = this.randomHexColor.bind(this);
    this.getBirdCSS = this.getBirdCSS.bind(this);
    this.getBirdImage = this.getBirdImage.bind(this);
    this._click = this._click.bind(this);
    this.tick = this.tick.bind(this);
    this.newPipe = this.newPipe.bind(this);
    this.testCollision = this.testCollision.bind(this);
    this.gameOver = this.gameOver.bind(this);
    this.startGame = this.startGame.bind(this);
    this.setBird = this.setBird.bind(this);
    this.addCustom = this.addCustom.bind(this);

    this.state = {
      newBest: false,
      userBird: '',
      bird: 'classic',

      score: 0,

      running: false,
      y: 350, //top of circle
      yVelocity: 0,

      pipes: [ // will always store exactly two pipes. Pipes are 400 px apart.
        {
          offset: 400,
          top: Math.random() * 500,
          color: this.randomHexColor(),
          key: 200
        },
        {
          offset: 800,
          top: Math.random() * 500,
          color: this.randomHexColor(),
          key: 201
        }
      ]
    };
  }


  componentDidMount() {
    if (!window.localStorage.getItem('highScore')) {
      window.localStorage.setItem('highScore', 0);
    }
    document.body.onkeydown = function(e){
      if(e.keyCode === 32 || e.keyCode === 38 || e.keyCode === 87){
          this._click();
      }
    }.bind(this);
  }

  randomHexColor() {
    return Math.floor(Math.random() * 16777216).toString(16).toUpperCase().padStart(6, '0');
  }

  getBirdImage () {
    //add feature to choose sprite based on velocity
    if (this.state.yVelocity < 0) {
      return spriteLibrary[this.state.bird]['1'];
    } else {
      return spriteLibrary[this.state.bird]['0'];
    }
  }

  getBirdCSS () {
    return {
      position: 'absolute',
      left: BIRD_OFFSET,
      top: this.state.y,
      width: DIAMETER,
      height: DIAMETER,
      backgroundColor: 'transparent',
      userSelect: 'none',
      objectFit: 'contain'
    };
  }



  newPipe() {
    var pointSound = document.getElementById('point');
    pointSound.currentTime = 0;
    pointSound.play();
    var newState = [];
    newState[0] = Object.assign({}, this.state.pipes[1]);
    // newState[0].color = this.randomHexColor();
    newState[1] = {
      offset: 700,
      top: Math.random() * 500,
      color: this.randomHexColor(),
      key: Math.random()
    };
    this.setState({
      pipes: newState,
      score: this.state.score + 1,
    });
  }

  _click() {
    if (this.state.running) {
      var flapSound = document.getElementById('flap');
      flapSound.currentTime = 0;
      flapSound.play();
      this.setState({
        yVelocity: JUMP_V
      });
    }
  }

  setBird(bird) {
    this.setState({
      bird: bird
    });
  }

  startGame() {
    this.setState({
      yVelocity: JUMP_V,
      running: true,
      score: 0,
      y: 350,
      pipes: [ // will always store exactly two pipes. Pipes are 400 px apart.
        {
          offset: 400,
          top: Math.random() * 500,
          color: this.randomHexColor(),
          key: 0
        },
        {
          offset: 800,
          top: Math.random() * 500,
          color: this.randomHexColor(),
          key: 1
        }
      ]

    }, this.tick);
  }

  tick() {
    if (!this.state.running) {
      return;
    }
    setTimeout(this.tick, 1000 / FRAME);
    this.testCollision();

    this.setState((state, props) => ({
      y: state.y + state.yVelocity / FRAME,
      yVelocity: state.yVelocity + GRAVITY / FRAME,
      pipes: [
        {
          top: state.pipes[0].top,
          offset: state.pipes[0].offset - (PIPE_VELOCITY / FRAME),
          color: state.pipes[0].color,
          key: state.pipes[0].key
        },
        {
          top: state.pipes[1].top,
          offset: state.pipes[1].offset - (PIPE_VELOCITY / FRAME),
          color: state.pipes[1].color,
          key: state.pipes[1].key
        }
      ]
    }), () => {
      if (this.state.pipes[0].offset < -100) {
        this.newPipe();
      }
    });
  }

  testCollision() {
    if (this.state.y > 700) {// hit the ground
      this.gameOver();
    }

    if (this.state.pipes[0].offset > 0 && this.state.pipes[0].offset < 150 && //is pipe in position to be hit?
      (this.state.y < this.state.pipes[0].top  || this.state.y > (this.state.pipes[0].top + PIPE_OPENING - DIAMETER)) // then test if hit
    ) {
      this.gameOver();
    }
  }

  gameOver() {
    var hitSound = document.getElementById('hit');
    hitSound.currentTime = 0;
    hitSound.play();
    var best = false;
    if (this.state.score > parseInt(window.localStorage.getItem('highScore'))) {
      best = true;
      window.localStorage.setItem('highScore', this.state.score);
    }
    this.setState({
      running: false,
      newBest: best
    });
  }

  addCustom(bird) {
    this.setState({
      userBird: bird
    });
  }

  render() {

    return (
      <div id="canvas" onClick={this._click}>
        <audio id="flap" src="wing.mp3" preload="auto"></audio>
        <audio id="hit" src="hit.mp3" preload="auto"></audio>
        <audio id="point" src="point.mp3" preload="auto"></audio>
        <p id="scoreboard">{this.state.score}</p>
        {this.state.running &&
          <React.Fragment>
            <img style={this.getBirdCSS()} src={this.getBirdImage()}/>

            <Pipe key={this.state.pipes[0].key} top={this.state.pipes[0].top} offset={this.state.pipes[0].offset} color={this.state.pipes[0].color}/>
            <Pipe key={this.state.pipes[1].key} top={this.state.pipes[1].top} offset={this.state.pipes[1].offset} color={this.state.pipes[1].color}/>


          </React.Fragment>
        }
        {!this.state.running &&
          <Menu startGame={this.startGame} setBird={this.setBird} currentBird={this.state.bird} addCustom={this.addCustom} userBird={this.state.userBird} newBest={this.state.newBest}/>
        }


      </div>
    );
  }
}
ReactDOM.render(<App />, document.getElementById('app'));