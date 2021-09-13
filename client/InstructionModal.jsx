import React, {useState} from 'react';

export default function InstructionModal(props) {
  const [open, setOpen] = useState(false);
  return (
    <React.Fragment>
      {open &&
        <div id="instructionBox">
          <p id="instructionText">
            Click, Space, Up, or W to jump. Good Luck!
          </p>
        </div>
      }
      <img id="instructionIcon" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} src="https://img.icons8.com/nolan/64/info.png"/>
    </React.Fragment>
  );
}