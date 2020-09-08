import React, { useState, useRef, useEffect, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useParams, useHistory } from 'react-router-dom';
import { Breadcrumb, Input } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import '../components/Chat/Chat.css'

import Messages from '../components/Chat/Messages/Messages'

import axios from 'axios';
import { useTranslation } from "react-i18next";
import moment from 'moment';
import SettingsContext from '../SettingsContext';
import 'moment/locale/de';
import 'moment/locale/en-gb';

const Chat = () => {
    const { t, i18n } = useTranslation();
    const [text, setText] = useState('');
    const { bot } = useParams();
    const history = useHistory();
    const [, updateState] = React.useState();
    const forceUpdate = React.useCallback(() => updateState({}), []);
    const messages = useRef([]);
    const settings = useContext(SettingsContext);
    const [chatIdentifier] = useState(uuidv4())

    
    useEffect(() => {
        axios.get(`${settings.botkit.host}:${settings.botkit.port}/bot/${bot}/status`).catch(error => {
            if (typeof error.response !== 'undefined' && error.response.status === 404) {
                history.push('/not-found');
            } else {
                console.warn('abotkit rest api is not available', error);
            }
        });
    }, [history, bot, settings]);

    let answer = (data) => {
        setTimeout(() => {
            messages.current = [...messages.current, {
                text: data.text,
                issuer: bot,
                time: moment().locale(i18n.languages[0]).format("YYYY-MM-DD HH:mm:ss"),
            }];
            forceUpdate();
        }, 800);
    };

    let sendMessage = async () => {
        if (!text) {
            return;
        }
        messages.current = [...messages.current, { text: text, issuer: t('chat.issuer.human'), time: moment().locale(i18n.languages[0]).format('YYYY-MM-DD HH:mm:ss') }];
        try {
            const response = await axios.post(`${settings.botkit.host}:${settings.botkit.port}/bot/handle`, { query: text, bot_name: bot, identifier: chatIdentifier });
            answer(response.data);
        } catch (error) {
            console.warn('abotkit rest api is not available', error);
            answer(t('chat.state.offline'));
        } finally {
            setText('');
        }
    }

    return (
        <div className="chat">
            <Breadcrumb style={{ margin: "16px 0" }}>
                <Breadcrumb.Item>{t("chat.breadcrumbs.home")}</Breadcrumb.Item>
                <Breadcrumb.Item>{t("chat.breadcrumbs.chat")}</Breadcrumb.Item>
                <Breadcrumb.Item>{bot}</Breadcrumb.Item>
            </Breadcrumb>

            <div className="outerContainer" >
                <div className="container container__body" id='chatview-container'>
                    <Messages messages={messages} name={messages.issuer}/>
                </div>
                <div className="inputContainer">
                    <Input
                    value={text}
                    onPressEnter={sendMessage}
                    onChange={e => setText(e.target.value)} 
                    placeholder={t("chat.input.placeholder")}
                    suffix={<MessageOutlined onClick={sendMessage} />}/>
                </div>
            </div>
        </div>
    );
};

export default Chat;
