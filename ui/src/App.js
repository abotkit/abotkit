import React from 'react';
import { Route } from 'react-router-dom'
import { Layout } from 'antd';
import Menu from './components/Menu';
import { Dashboard, Actions, Crawler, Classifier } from './pages';
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
            <Route path="/" exact component={Dashboard} />
            <Route path="/actions" component={Actions} />
            <Route path="/classifier" component={Classifier} />
            <Route path="/crawler" component={Crawler} />
          </Content>
          <Footer style={{ textAlign: 'center' }}>abotkit ©2020</Footer>
        </Layout>
    </div>
  );
}

export default App;
