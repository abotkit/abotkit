import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom'
import { Layout } from 'antd';
import Menu from './components/Menu';
import { Settings, Chat, Actions, Intents, About, BotNotFound } from './pages';
import './App.css';
const { Header, Content, Footer } = Layout;

const Main = () => {
  const { path } = useRouteMatch();
  return (
    <>
      <Header>
        <div className="logo" />
        <Menu />
      </Header>
      <Content style={{ padding: '0 50px' }}>
        <Switch>
          <Route path={`${path}`} exact component={Chat} />
          <Route path={`${path}/chat`} component={Chat} />
          <Route path={`${path}/actions`} component={Actions} />
          <Route path={`${path}/intents`} component={Intents} />
          <Route path={`${path}/settings`} component={Settings} />
        </Switch>
      </Content>
      <Footer style={{ textAlign: 'center' }}>abotkit ©2020</Footer>
    </>
  );
};


const App = () => {
  return (
    <div className="app">
      <Layout className="layout">
        <Switch>
          <Route path="/" exact component={About} />
          <Route path="/not-found" exact component={BotNotFound} />
          <Route path="/:bot" component={Main} />
        </Switch> 
      </Layout>
    </div>
  );
}

export default App;
