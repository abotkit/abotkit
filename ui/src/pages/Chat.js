import React, { useState, useRef } from 'react';
import { Breadcrumb, Comment, Avatar, Tooltip, Input, Icon } from 'antd';
import axios from 'axios';
import moment from 'moment';

const Chat = () => {
    const [text, setText] = useState('');
    const [, updateState] = React.useState();
    const forceUpdate = React.useCallback(() => updateState({}), []);
    const messages = useRef([]);

    let answer = text => {
        setTimeout(() => {
            messages.current = [
                ...messages.current, 
                { text: text, issuer: 'A bot', time: moment().format('YYYY-MM-DD HH:mm:ss') }
            ]
            forceUpdate();
        }, 800);
    }

    let sendMessage = async () => {
        messages.current = [...messages.current, { text: text, issuer: 'Human', time: moment().format('YYYY-MM-DD HH:mm:ss') }];
        try {
            let explainResponse = await axios.post('http://localhost:5000/explain', { query: text });
            if (!explainResponse.data.intent) {
                answer('It doesn\'t look like anything to me');
            } else {
                let handleResponse = await axios.post('http://localhost:5000/handle', { query: text });
                answer(handleResponse.data);
            }
        } catch (error) {
            console.warn('abotkit rest api is not available', error);
            answer('Sorry I\'m offline');
        } finally {
            setText('');
        }
    }

    return (
        <>
            <Breadcrumb style={{ margin: '16px 0' }}>
                <Breadcrumb.Item>Home</Breadcrumb.Item>
                <Breadcrumb.Item>Chat</Breadcrumb.Item>
            </Breadcrumb>
            <Input
                value={text} 
                onChange={e => setText(e.target.value)} 
                placeholder="Ask a bot" onPressEnter={sendMessage} 
                addonAfter={<Icon type="message" onClick={sendMessage} />}/>
            <br /><br />
            <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
                { messages.current.map((message, i) => <Comment key={i}
                    author={<span>{ message.issuer }</span>}
                    avatar={<Avatar icon="user" />}
                    content={<p>{ message.text }</p>}
                    datetime={
                    <Tooltip title={message.time}>
                        <span>{moment(message.time, 'YYYY-MM-DD HH:mm:ss').fromNow()}</span>
                    </Tooltip>
                    }
                /> )}
            </div>
        </>
    );
}

export default Chat;