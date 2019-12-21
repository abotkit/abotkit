import React, { useState, useEffect } from 'react';
import { Breadcrumb, Card, Switch, Modal, Input } from 'antd';
import axios from 'axios';

const ActionOverview = () => {
    const [actions, setActions] = useState([]);
    const [dialogTitle, setDialogTitle] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogAction, setDialogAction] = useState();
    const [intentText, setIntentText] = useState('');

    useEffect(() => {
        axios.get('http://localhost:5000/actions').then(response => {
            setActions(response.data);
        }).catch(error => {
            console.warn('abotkit rest api is not available', error);
        })        
    }, []);

    const toggleAction = action => {
        setIntentText(action.name.toLowerCase().replace(/[^\w]/g, '_'));
        let actionType = action.active ? 'Deactivate' : 'Activate';
        let title = actionType + ' ' + action.name;

        setDialogTitle(title);
        setDialogAction(action);
        setDialogOpen(true);
    }

    const handleOk = () => {
        let refreshActions = () => axios.get('http://localhost:5000/actions')
        .then(response => {
            setActions(response.data);
        }).catch(error => {
            console.warn('abotkit rest api is not available', error);
        })

        if (dialogAction.active) {
            axios.delete('http://localhost:5000/actions', {
                data: { intent: dialogAction.active.intent }
            }).then(() => refreshActions());
        } else {
            axios.post('http://localhost:5000/actions', {
                intent: intentText,
                settings: {},
                name: dialogAction.name
            }).then(() => refreshActions());
        }

        setDialogOpen(false);
        setIntentText('');
    }

    const handleCancel = () => {
        setDialogOpen(false);
        setIntentText('');
    }

    let content = <p></p>
    if (dialogAction) {
        let actionType = dialogAction.active ? 'Deactivate' : 'Activate';
        content = <h4>{'Do you really want to ' + actionType.toLowerCase() + ' ' + dialogAction.name + '?'}</h4>;
        
        if (actionType === 'Deactivate') {
            content = <>
                {content}
                <p>{'Currently bound to the intent "' + dialogAction.active.intent + '"'}</p>
            </>
        } else {
            content = <>
                {content}
                <span>Bound this new action to the intent</span>
                <Input
                    value={intentText}
                    onChange={e => setIntentText(e.target.value)}
                />                
            </>            
        }
    }

    return (
        <>
            <Breadcrumb style={{ margin: '16px 0' }}>
                <Breadcrumb.Item>Home</Breadcrumb.Item>
                <Breadcrumb.Item>Actions</Breadcrumb.Item>
            </Breadcrumb>

            <Modal
                title={dialogTitle}
                visible={dialogOpen}
                onOk={handleOk}
                okText="Yes"
                onCancel={handleCancel}>
                {content}
            </Modal>

            <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
                { actions.map((action, i) => {
                    return(
                        <Card 
                            title={
                                <div className="abotkit-action-title">
                                    <span>{action.name}</span>
                                    <Switch checked={typeof action.active === 'object'} onChange={() => toggleAction(action)} />
                                </div>
                            } 
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