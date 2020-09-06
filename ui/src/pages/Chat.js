import React, { useState, useRef, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Breadcrumb, Input } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import '../components/Chat/Chat.css'

import Messages from '../components/Chat/Messages/Messages'

import axios from 'axios';
import moment from 'moment';

const Chat = () => {
    const [text, setText] = useState('');
    const { bot } = useParams();
    const history = useHistory();
    const [, updateState] = React.useState();
    const forceUpdate = React.useCallback(() => updateState({}), []);
    const messages = useRef([]);

    
    useEffect(() => {
        axios.get(`http://localhost:3000/bot/${bot}/status`).catch(error => {
            if (typeof error.response !== 'undefined' && error.response.status === 404) {
                history.push('/not-found');
            } else {
                console.warn('abotkit rest api is not available', error);
            }
        });
    }, [history, bot]);

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
        if (!text) {
            return;
        }
        messages.current = [...messages.current, { text: text, issuer: 'Human', time: moment().format('YYYY-MM-DD HH:mm:ss') }];
        try {
            let explainResponse = await axios.post('http://localhost:3000/bot/explain', { query: text, bot_name: bot });
            if (!explainResponse.data.intent) {
                answer('It doesn\'t look like anything to me');
            } else {
                let handleResponse = await axios.post('http://localhost:3000/bot/handle', { query: text, bot_name: bot });
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
        <div className="chat">
            <Breadcrumb style={{ margin: '16px 0' }}>
                <Breadcrumb.Item>Home</Breadcrumb.Item>
                <Breadcrumb.Item>Chat</Breadcrumb.Item>
                <Breadcrumb.Item>{ bot }</Breadcrumb.Item>
            </Breadcrumb>
            <div className="outerContainer" >
                <div className="container container__body" id='chatview-container'>
                    <Messages messages={messages} name={messages.issuer}/>
                </div>
                <div className="inputContainer">
                    <Input
                    value={text} 
                    onChange={e => setText(e.target.value)} 
                    placeholder="Ask a bot" onPressEnter={sendMessage} 
                    suffix={<MessageOutlined onClick={sendMessage} />}/>
                </div>
            </div>
        </div>
    );
}

export default Chat;