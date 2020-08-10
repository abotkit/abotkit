import React from 'react';
import { Link, withRouter, useParams, useRouteMatch } from 'react-router-dom';
import { Menu } from 'antd';

const AbotkitMenu = withRouter(props => {
  const { location } = props;
  const { bot } = useParams();
  const { url } = useRouteMatch();

  if (typeof bot === 'undefined') {
    return null;
  }

  return (
    <Menu 
    theme="dark"
    mode="horizontal"
    style={{ lineHeight: '64px' }}
    selectedKeys={[location.pathname]}>
      <Menu.Item key={`${url}/chat`}>
        <Link to={`${url}/chat`}>Chat</Link>
      </Menu.Item>
      <Menu.Item key={`${url}/intents`}>
        <Link to={`${url}/intents`}>Intents</Link>
      </Menu.Item>
      <Menu.Item key={`${url}/actions`}>
        <Link to={`${url}/actions`}>Actions</Link>
      </Menu.Item>
      <Menu.Item key={`${url}/settings`}>
        <Link to={`${url}/settings`}>Settings </Link>
      </Menu.Item>
    </Menu>
  );
});

export default AbotkitMenu;
