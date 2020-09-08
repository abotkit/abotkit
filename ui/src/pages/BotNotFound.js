import React from 'react';
import { createUseStyles } from 'react-jss';
import { CompassOutlined, HomeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  return <div className={classes.page}>
    <h2 style={{ textTransform: 'uppercase', fontSize: '1.5rem' }}>{ t('not-found.text') }</h2>
    <CompassOutlined style={{ margin: '20vh 0', fontSize: '4rem' }} />
    <Link to="/" style={{ fontSize: '1.5rem'}}>{ t('not-found.back') } <HomeOutlined /></Link>
  </div>
}

export default BotNotFound;