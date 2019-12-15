import React, { useEffect } from 'react';
import { Route } from 'react-router-dom'
import { Layout } from 'antd';
import Menu from './components/Menu';
import Settings from './pages/Settings';
import Chat from './pages/Chat';
import Actions from './pages/Actions';
import axios from 'axios';
import './App.css';
const { Header, Content, Footer } = Layout;

function App() {

  useEffect(() => {
    try {
      axios.post('http://localhost:5000/actions', {
        name: "Shout",
        settings: {},
        intent: "shout"
      });
      axios.post('http://localhost:5000/example', { example: "Hi", intent: "shout" });
    } catch (error) {
      console.warn('failed to add custom actions and intents');
    }
  }, []);

  return (
    <div className="app">
      <Layout className="layout">
          <Header>
            <div className="logo" />
            <Menu />
          </Header>
          <Content style={{ padding: '0 50px' }}>
            <Route path="/" exact component={Chat} />
            <Route path="/actions" component={Actions} />
            <Route path="/settings" component={Settings} />
          </Content>
          <Footer style={{ textAlign: 'center' }}>abotkit ©2019</Footer>
        </Layout>
    </div>
  );
}

export default App;
