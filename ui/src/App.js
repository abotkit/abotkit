import React, { useState } from 'react';
import { Layout, Menu, Breadcrumb } from 'antd';
import axios from 'axios';

import './App.css';
const { Header, Content, Footer } = Layout;

function App() {
  const [botState, setBotState] = useState('Your bot is down.');

  axios.get('http://localhost:5000').then(response => {
    setBotState('A bot: ' + response.data);
  }).catch(error => {
    console.warn('abotkit rest api is not available', error);
  })

  return (
    <div className="app">
      <Layout className="layout">
          <Header>
            <div className="logo" />
            <Menu
              theme="dark"
              mode="horizontal"
              defaultSelectedKeys={['2']}
              style={{ lineHeight: '64px' }}
            >
              <Menu.Item key="1">Info</Menu.Item>
              <Menu.Item key="2">Actions</Menu.Item>
              <Menu.Item key="3">Test</Menu.Item>
            </Menu>
          </Header>
          <Content style={{ padding: '0 50px' }}>
            <Breadcrumb style={{ margin: '16px 0' }}>
              <Breadcrumb.Item>Home</Breadcrumb.Item>
              <Breadcrumb.Item>Info</Breadcrumb.Item>
              <Breadcrumb.Item>Bot</Breadcrumb.Item>
            </Breadcrumb>
            <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>{ botState }</div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>abotkit ©2018</Footer>
        </Layout>
    </div>
  );
}

export default App;
