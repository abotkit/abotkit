import React, { useState, useEffect, useContext } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Breadcrumb, Card } from 'antd';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import SettingsContext from '../SettingsContext';

const Actions = () => {
  const { bot } = useParams();
  const [actions, setActions] = useState([]);
  const history = useHistory();
  const { t } = useTranslation();
  const settings = useContext(SettingsContext);

  useEffect(() => {
    axios.get(`${settings.botkit.host}:${settings.botkit.port}/bot/${bot}/status`).then(() => {
      axios.get(`${settings.botkit.host}:${settings.botkit.port}/bot/${bot}/actions`).then(response => {
        setActions(response.data);
      }).catch(error => {
        console.warn('abotkit rest api is not available', error);
      })
    }).catch(error => {
      if (typeof error.response !== 'undefined' && error.response.status === 404) {
        history.push('/not-found');
      } else {
        console.warn('abotkit rest api is not available', error);
      }
    });    
  }, [bot, history, settings]);

  return (
    <>
      <Breadcrumb style={{ margin: '16px 0' }}>
        <Breadcrumb.Item>{ t('actions.breadcrumbs.home') }</Breadcrumb.Item>
        <Breadcrumb.Item>{ t('actions.breadcrumbs.actions') }</Breadcrumb.Item>
      </Breadcrumb>
      <h1>{ t('actions.headline') }</h1>
      { actions.map((action, i) => {
        let title = <div>{action.name}</div>
        return(
          <Card 
            title={title} 
            key={i} 
            style={{ width: '100%', marginBottom: 15 }}>
            <p>{action.description}</p>
          </Card>
        )
      })}
    </>
  );
}

export default Actions;