import React, { useState, useEffect } from 'react';
import { Breadcrumb, Collapse } from 'antd';
import axios from 'axios';

const { Panel } = Collapse;

const Actions = () => {  
    const [actions, setActions] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:3000/bot/actions').then(response => {
            setActions(response.data);
          }).catch(error => {
            console.warn('abotkit rest api is not available', error);
          })        
    }, []);

    return (
        <>
            <Breadcrumb style={{ margin: '16px 0' }}>
                <Breadcrumb.Item>Home</Breadcrumb.Item>
                <Breadcrumb.Item>Talk</Breadcrumb.Item>
            </Breadcrumb>
            <h1>Edit Predefined Phrases</h1>
            <Collapse defaultActiveKey={['1']}>
              <Panel header="hello" key="1">
                <p>Hello</p>
                <p>Hi</p>
              </Panel>
              <Panel header="bye" key="2">
                <p>Bye</p>
              </Panel>
            </Collapse>
 
        </>
    );
}

export default Actions;