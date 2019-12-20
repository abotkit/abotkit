import React, { useState, useEffect } from 'react';
import { Breadcrumb, Card, Tag } from 'antd';
import axios from 'axios';

const ActionOverview = () => {
    const [actions, setActions] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/actions').then(response => {
            setActions(response.data);
          }).catch(error => {
            console.warn('abotkit rest api is not available', error);
          })        
    }, []);

    return (
        <>
            <Breadcrumb style={{ margin: '16px 0' }}>
                <Breadcrumb.Item>Home</Breadcrumb.Item>
                <Breadcrumb.Item>Actions</Breadcrumb.Item>
            </Breadcrumb>
            <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
                { actions.map((action, i) => {
                    let active = action.active ? <Tag color="green">active</Tag> : <Tag color="red">inactive</Tag>;
                    let title = <div>{active} {action.name}</div>
                    return(
                        <Card 
                            title={title} 
                            key={i} 
                            style={{ width: '100%', marginBottom: 15 }}>
                            <p>{action.description}</p>
                        </Card>
                    )
                })}
            </div>
        </>
    );
}

export default ActionOverview;