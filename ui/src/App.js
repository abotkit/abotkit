import React from 'react';
import { Route } from 'react-router-dom'
import { Layout } from 'antd';
import Menu from './components/Menu';
import Info from './pages/Info';
import Actions from './pages/Actions';

import './App.css';
const { Header, Content, Footer } = Layout;

function App() {
  return (
    <div className="app">
      <Layout className="layout">
          <Header>
            <div className="logo" />
            <Menu />
          </Header>
          <Content style={{ padding: '0 50px' }}>
            <Route path="/" exact component={Info} />
            <Route path="/actions" component={Actions} />
          </Content>
          <Footer style={{ textAlign: 'center' }}>abotkit ©2019</Footer>
        </Layout>
    </div>
  );
}

export default App;
