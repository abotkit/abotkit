import React, { useState, useEffect } from 'react';
import { Breadcrumb, Card } from 'antd';
import axios from 'axios';

const ActionOverview = () => {
    const [actions, setActions] = useState([]);
    const [text, setText] = useState('');

    useEffect(() => {
        axios.get('http://localhost:5000/actions').then(response => {
            setActions(response.data);
          }).catch(error => {
            console.warn('abotkit rest api is not available', error);
          })
    }, []);

    let sendMessage = () => {
        setText('');
    }

    return (
        <>
            <Breadcrumb style={{ margin: '16px 0' }}>
                <Breadcrumb.Item>Home</Breadcrumb.Item>
                <Breadcrumb.Item>Actions</Breadcrumb.Item>
            </Breadcrumb>
            <Input
                value={text} 
                onChange={e => setText(e.target.value)} 
                placeholder="Ask a bot" onPressEnter={sendMessage} 
                addonAfter={<Icon type="message" onClick={sendMessage} />}/>
            <br /><br />
            <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
                { actions.map((action, i) =>
                    <Card 
                        title={action.name} 
                        key={i} 
                        style={{ width: '100%', marginBottom: 15 }}>
                        <p>{action.description}</p>
                    </Card>
                )}
            </div>
        </>
    );
}

export default ActionOverview;