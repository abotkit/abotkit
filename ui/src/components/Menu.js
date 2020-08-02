import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Menu } from 'antd';

const AbotkitMenu = withRouter(props => {
  const { location } = props;
  return (
    <Menu 
    theme="dark"
    mode="horizontal"
    style={{ lineHeight: '64px' }}
    selectedKeys={[location.pathname]}>
      <Menu.Item key="/">
        <Link to="/">Chat</Link>
      </Menu.Item>
      <Menu.Item key="/intents">
        <Link to="/intents">Intents</Link>
      </Menu.Item>
      <Menu.Item key="/actions">
        <Link to="/actions">Actions</Link>
      </Menu.Item>
      <Menu.Item key="/settings">
        <Link to="/settings">Settings </Link>
      </Menu.Item>
    </Menu>
  );
});

export default AbotkitMenu;
