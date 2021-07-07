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

    this.getBirdCSS = this.getBirdCSS.bind(this);
    this.getBirdImage = this.getBirdImage.bind(this);
    this._click = this._click.bind(this);
    this.tick = this.tick.bind(this);
    this.newPipe = this.newPipe.bind(this);
    this.testCollision = this.testCollision.bind(this);
    this.gameOver = this.gameOver.bind(this);
    this.startGame = this.startGame.bind(this);
    this.setBird = this.setBird.bind(this);

    this.state = {
      bird: 'classic',

      score: 0,

      running: false,
      y: 350, //top of circle
      yVelocity: 0,

      pipes: [ // will always store exactly two pipes. Pipes are 400 px apart.
        {
          offset: 400,
          top: Math.random() * 500
        },
        {
          offset: 800,
          top: Math.random() * 500
        }
      ]
    };
  }


  componentDidMount() {
    if (!window.localStorage.getItem('highScore')) {
      window.localStorage.setItem('highScore', 0);
    }
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
    var newState = [];
    newState[0] = this.state.pipes[1];
    newState[1] = {
      offset: 700,
      top: Math.random() * 500
    };
    this.setState({
      pipes: newState,
      score: this.state.score + 1
    });
  }

  _click() { //shoud eventually remove game starting code
    if (this.state.running) {
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
          top: Math.random() * 500
        },
        {
          offset: 800,
          top: Math.random() * 500
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
          offset: state.pipes[0].offset - (PIPE_VELOCITY / FRAME)
        },
        {
          top: state.pipes[1].top,
          offset: state.pipes[1].offset - (PIPE_VELOCITY / FRAME)
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
    if (this.state.score > parseInt(window.localStorage.getItem('highScore'))) {
      window.localStorage.setItem('highScore', this.state.score);
    }
    this.setState({
      running: false
    });
    // alert('hahaha');
  }

  render() {
    return (
      <div id="canvas" onClick={this._click}>
        <p id="scoreboard">{this.state.score}</p>
        {this.state.running &&
          <React.Fragment>
            <img style={this.getBirdCSS()} src={this.getBirdImage()}/>

            <Pipe top={this.state.pipes[0].top} offset={this.state.pipes[0].offset}/>
            <Pipe top={this.state.pipes[1].top} offset={this.state.pipes[1].offset}/>


          </React.Fragment>
        }
        {!this.state.running &&
          <Menu startGame={this.startGame} setBird={this.setBird} currentBird={this.state.bird}/>
        }


      </div>
    );
  }
}
ReactDOM.render(<App />, document.getElementById('app'));