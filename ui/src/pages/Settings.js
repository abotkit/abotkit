import React, { useState, useEffect } from 'react';
import { Breadcrumb, Tag } from 'antd';
import axios from 'axios';

const Settings = () => {
    const [botAlive, setbotAlive] = useState(false);

    useEffect(() => {
        axios.get('http://localhost:5000').then(response => {
            setbotAlive(true);
          }).catch(error => {
            console.warn('abotkit rest api is not available', error);
          })      
    }, []);
  
    return (
        <>
            <Breadcrumb style={{ margin: '16px 0' }}>
                <Breadcrumb.Item>Home</Breadcrumb.Item>
                <Breadcrumb.Item>Settings</Breadcrumb.Item>
            </Breadcrumb>
            <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
                <span>A bot state: { botAlive ? <Tag color="green">online</Tag> : <Tag color="red">offline</Tag> }</span>
            </div>
        </>
    );
}

export default Settings;