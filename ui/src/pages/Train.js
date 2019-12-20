import React, { useState, useEffect } from 'react';
import { Breadcrumb, Dropdown, Menu, Input, Button, Icon, List } from 'antd';
import axios from 'axios';

const ActionOverview = () => {
    const [actions, setActions] = useState([]);
    const [examples, setExamples] = useState([]);
    const [text, setText] = useState('');
    const [selectedAction, setSelectedAction] = useState([0]);

    useEffect(() => {
        axios.get('http://localhost:5000/actions').then(response => {
            setActions(response.data);
        }).catch(error => {
            console.warn('abotkit rest api is not available', error);
        })
    }, []);

    useEffect(() => {
        if (actions.length > 0) {
            let action = actions[selectedAction[0]];
            if (action.active) {
                axios.get('http://localhost:5000/example/' + action.active.intent).then(response => {
                    setExamples(response.data);
                }).catch(error => {
                    console.warn('abotkit rest api is not available', error);
                })
            }
        }
    }, [actions, selectedAction]);

    const handleMenuClick = event => {
        setSelectedAction([event.key]);
    }

    const action = actions.length > 0 ? actions[selectedAction[0]] : null;

    const pushExample = () => {
        if (action.active) {
            axios.post('http://localhost:5000/example', { "example": text, "intent": action.active.intent}).then(response => {
                axios.get('http://localhost:5000/actions').then(response => {
                    setActions(response.data);
                }).catch(error => {
                    console.warn('abotkit rest api is not available', error);
                })                
            }).finally(() => setText(''));
        }
    }
    
    const menu = (<Menu selectedKeys={selectedAction} onClick={handleMenuClick}>
        {actions.map((action, i) => <Menu.Item key={i}>{action.name}</Menu.Item>)}
    </Menu>)

    return ( 
        <>
            <Breadcrumb style={{ margin: '16px 0' }}>
                <Breadcrumb.Item>Home</Breadcrumb.Item>
                <Breadcrumb.Item>Actions</Breadcrumb.Item>
            </Breadcrumb>
            { action ? <><div className="abotkit-train-input">
                <Input
                    value={text}
                    onPressEnter={pushExample}
                    onChange={e => setText(e.target.value)}
                    disabled={!action.active}
                    addonAfter="is an example for"/>
                <div className="abotkit-separator"/>
                <Dropdown overlay={menu}>
                    <Button>
                        {action ? action.name : 'Action'} <Icon type="down" />
                    </Button>
                </Dropdown>
                <div className="abotkit-separator"/>
                <Button type="primary" icon="plus" onClick={pushExample} disabled={!action.active}>Add</Button>
            </div>
            <br /><br />
            
            <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
                <h3>{action.name}</h3>
                <h4>{action.description}</h4>
                <br />
                { action.active ? 
                <List
                    size="small"
                    bordered
                    dataSource={examples}
                    renderItem={item => <List.Item>{item}</List.Item>}
                />
                : null }
            </div></> : null }
        </>
    );
}

export default ActionOverview;