import React from 'react';
import { Route } from 'react-router-dom'
import { Layout } from 'antd';
import Menu from './components/Menu';
import Settings from './pages/Settings';
import Info from './pages/Info';
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
            <Route path="/settings" component={Settings} />
          </Content>
          <Footer style={{ textAlign: 'center' }}>abotkit ©2020</Footer>
        </Layout>
    </div>
  );
}

export default App;
