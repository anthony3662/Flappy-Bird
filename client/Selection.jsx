import React from 'react';
export default function Selection(props) {

  return(
    <button className="selection" onClick={() => {
      if (props.score >= props.scoreRequired) props.setBird(props.bird);
      }}>
      {props.score >= props.scoreRequired ? props.bird : `${props.bird} ${props.scoreRequired} High Score Required`}
    </button>
  );
}