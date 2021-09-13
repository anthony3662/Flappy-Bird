import React from 'react';

const PIPE_WIDTH = 100;
const PIPE_OPENING = 200;

export default function Pipe(props) { //props.color, props.top, props.offset
  var topStyle = {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    left: props.offset,
    top: 0,
    width: PIPE_WIDTH,
    height: props.top,
    backgroundColor: '#' + props.color,
    border: 'solid 2px black',
    borderRadius: 5
  };
  var bottomStyle = {
    position: 'absolute',
    left: props.offset,
    top: props.top + PIPE_OPENING,
    width: PIPE_WIDTH,
    height: 500,
    backgroundColor: '#' + props.color,
    border: 'solid 2px black',
    borderRadius: 5
  };
  return (
    //1 in 15 chance of easter egg pipe (3/5 chance pipe is required size * additional 1 / 9)
    <React.Fragment>
      <div id={'0 ' + props.color} style={topStyle}>{(props.top > 200 && Math.floor(props.top) % 9  === 2) ? <p className="secret">EASTER EGG PIPE ♡♡♡♡♡♡ 💯💯💯💯💯 ASK THE CREATOR ABOUT HIS TATTOO</p> : ''}</div>
      <div id={'1 ' + props.color} style={bottomStyle}></div>
    </React.Fragment>
  );
};