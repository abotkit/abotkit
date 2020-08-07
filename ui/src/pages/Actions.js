import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Breadcrumb, Card } from 'antd';
import axios from 'axios';

const Actions = () => {
  const { bot } = useParams();
  const [actions, setActions] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:3000/bot/${bot}/actions`).then(response => {
      setActions(response.data);
    }).catch(error => {
      console.warn('abotkit rest api is not available', error);
    })        
  }, [bot]);

  return (
    <>
      <Breadcrumb style={{ margin: '16px 0' }}>
        <Breadcrumb.Item>Home</Breadcrumb.Item>
        <Breadcrumb.Item>Actions</Breadcrumb.Item>
      </Breadcrumb>
      <h1>Available Actions</h1>
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