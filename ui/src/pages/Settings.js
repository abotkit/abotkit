import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Breadcrumb, Tag } from 'antd';
import axios from 'axios';
import { Select } from 'antd';
import { useTranslation } from "react-i18next";
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  headline: {
    paddingBottom: 8
  }
});

const { Option } = Select;

const Settings = () => {
  const { bot } = useParams();
  const history = useHistory();
  const [botAlive, setbotAlive] = useState(false);
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const { t, i18n } = useTranslation();
  const classes = useStyles();

  const [language, setLanguage] = useState(i18n.languages[0].substring(0,2).toLocaleLowerCase());
  
  const changeLanguage = value => {
    setLanguage(value);
    i18n.changeLanguage(value);
  }

  useEffect(() => {
    axios.get(`http://localhost:3000/bot/${bot}/status`).then(response => {
      setbotAlive(true);
      axios.get(`http://localhost:3000/bot/${bot}/settings`).then(response => {
        const { host, port } = response.data;
        setHost(host);
        setPort(port)
      }).catch(error => {
        console.warn('unable to fetch bot settings', error);
      });
    }).catch(error => {
      if (typeof error.response !== 'undefined' && error.response.status === 404) {
        history.push('/not-found');
      } else {
        console.warn('abotkit rest api is not available', error);
      }
    })      
  }, [bot, history]);

  return (
    <>
      <Breadcrumb style={{ margin: '16px 0' }}>
        <Breadcrumb.Item>{ t('settings.breadcrumbs.home') }</Breadcrumb.Item>
        <Breadcrumb.Item>{ t('settings.breadcrumbs.settings')}</Breadcrumb.Item>
      </Breadcrumb>
      <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
        <h3 className={classes.headline}>{ t('settings.general.headline') }</h3>
        <Select
          showSearch
          value={language}
          style={{ width: 200 }}
          onChange={changeLanguage}
        >
          <Option value="en">English</Option>
          <Option value="de">Deutsch</Option>
        </Select>
        <h3 className={classes.headline} style={{ paddingTop: 16 }}>{ t('settings.bot.headline') }</h3>
        <p>{ t('settings.bot.state') }: { botAlive ? <Tag color="green">{ t('settings.bot.online') }</Tag> : <Tag color="red">{ t('settings.bot.offline') }</Tag> }</p>
        { host !== '' ? <p>{bot} { t('settings.bot.running') } {host}:{port}</p> : null}
      </div>
    </>
  );
}

export default Settings;
