import React from 'react';
import { Link, withRouter, useParams, useRouteMatch } from 'react-router-dom';
import { Menu } from 'antd';
import { useTranslation } from 'react-i18next';

const AbotkitMenu = withRouter(props => {
  const { location } = props;
  const { t } = useTranslation();
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
        <Link to={`${url}/chat`}>{ t('menu.chat') }</Link>
      </Menu.Item>
      <Menu.Item key={`${url}/intents`}>
        <Link to={`${url}/intents`}>{ t('menu.intents') }</Link>
      </Menu.Item>
      <Menu.Item key={`${url}/actions`}>
        <Link to={`${url}/actions`}>{ t('menu.actions') }</Link>
      </Menu.Item>
      <Menu.Item key={`${url}/settings`}>
        <Link to={`${url}/settings`}>{ t('menu.settings') }</Link>
      </Menu.Item>
    </Menu>
  );
});

export default AbotkitMenu;
