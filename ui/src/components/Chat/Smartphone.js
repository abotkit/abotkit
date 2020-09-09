import React from 'react';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  phone: {
    position: 'relative',
    width: 360,
    height: 640,
    margin: 'auto',
    border: '16px black solid',
    borderTopWidth: 60,
    borderBottomWidth: 60,
    borderRadius: 36,
    "&:before": {
      content: '""',
      display: 'block',
      width: 60,
      height: '5px',
      position: 'absolute',
      top: -30,
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: '#333',
      borderRadius: 10
    },
    "&:after": {
      content: '""',
      display: 'block',
      width: 35,
      height: 35,
      position: 'absolute',
      left: '50%',
      bottom: -65,
      transform: 'translate(-50%, -50%)',
      background: '#333',
      borderRadius: '50%'
    }
  },
  content: {
    width: '100%',
    height: '100%',
    background: 'white'
  }
})

const Smartphone = props => {
  const classes = useStyles();

  return (
    <div className={classes.phone}>
      <div className={classes.content}>
        { props.children }
      </div>
    </div>
  );
}

export default Smartphone;