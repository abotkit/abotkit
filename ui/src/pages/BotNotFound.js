import React from 'react';
import { createUseStyles } from 'react-jss';
import { CompassOutlined, HomeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const useStyles = createUseStyles({
  page: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    flexDirection: 'column' 
  }
});




const BotNotFound = () => {
  const classes = useStyles();

  return <div className={classes.page}>
    <h2 style={{ textTransform: 'uppercase', fontSize: '1.5rem' }}>This isn't the droid you're looking for</h2>
    <CompassOutlined style={{ margin: '20vh 0', fontSize: '4rem' }} />
    <Link to="/" style={{ fontSize: '1.5rem'}}>Go back <HomeOutlined /></Link>
  </div>
}

export default BotNotFound;