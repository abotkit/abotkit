import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Breadcrumb, Tag } from 'antd';
import axios from 'axios';

const Settings = () => {
  const { bot } = useParams();
  const history = useHistory();
  const [botAlive, setbotAlive] = useState(false);
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');

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
        <Breadcrumb.Item>Home</Breadcrumb.Item>
        <Breadcrumb.Item>Settings</Breadcrumb.Item>
      </Breadcrumb>
      <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
        <span>Bot state: { botAlive ? <Tag color="green">online</Tag> : <Tag color="red">offline</Tag> }</span>
        { host !== '' ? <p>{bot} is running at: {host}:{port}</p> : null}
      </div>
    </>
  );
}

export default Settings;
