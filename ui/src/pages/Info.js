import React, { useState, useEffect } from 'react';
import { Breadcrumb } from 'antd';
import axios from 'axios';

const Info = () => {
    const [botState, setBotState] = useState('Your bot is down.');

    useEffect(() => {
        axios.get('http://localhost:5000').then(response => {
            setBotState('A bot: ' + response.data);
          }).catch(error => {
            console.warn('abotkit rest api is not available', error);
          })      
    }, []);
  
    return (
        <>
            <Breadcrumb style={{ margin: '16px 0' }}>
                <Breadcrumb.Item>Home</Breadcrumb.Item>
                <Breadcrumb.Item>Info</Breadcrumb.Item>
            </Breadcrumb>
            <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>{ botState }</div>
        </>
    );
}

export default Info;