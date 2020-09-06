import React, { useState, useRef, useEffect, useContext } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Breadcrumb, Comment, Avatar, Tooltip, Input } from 'antd';
import { MessageOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useTranslation } from "react-i18next";
import moment from 'moment';
import SettingsContext from '../SettingsContext';
import 'moment/locale/de';
import 'moment/locale/en-gb';
import uuid4 from "uuid4";

const Chat = () => {
    const { t, i18n } = useTranslation();
    const [text, setText] = useState('');
    const { bot } = useParams();
    const history = useHistory();
    const [, updateState] = React.useState();
    const forceUpdate = React.useCallback(() => updateState({}), []);
    const messages = useRef([]);
    const settings = useContext(SettingsContext);
    const [chatIdentifier, setChatIdentifier] = useState(uuid4())

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
            let explainResponse = await axios.post(`${settings.botkit.host}:${settings.botkit.port}/bot/explain`, { query: text, bot_name: bot });
            if (!explainResponse.data.intent) {
                answer(t('chat.state.unavailable'));
            } else {
                let handleResponse = await axios.post(`${settings.botkit.host}:${settings.botkit.port}/bot/handle`, { query: text, bot_name: bot });
                answer(handleResponse.data);
            }
        } catch (error) {
            console.warn('abotkit rest api is not available', error);
            answer(t('chat.state.offline'));
        } finally {
            setText('');
        }
    }

    messages.current = [...messages.current, {
                            text: text,
                            issuer: t("chat.issuer.human"),
                            time: moment().locale(i18n.languages[0]).format("YYYY-MM-DD HH:mm:ss"),
                        }];
    try {
        let handleResponse = await axios.post("http://localhost:3000/bot/handle", { query: text, bot_name: bot, identifier: chatIdentifier });
        answer(handleResponse.data);
    } catch (error) {
        console.warn("abotkit rest api is not available", error);
        answer(t("chat.state.offline"));
    } finally {
        setText("");
    }
  
    return (
        <div className="chat">
            <Breadcrumb style={{ margin: "16px 0" }}>
                <Breadcrumb.Item>{t("chat.breadcrumbs.home")}</Breadcrumb.Item>
                <Breadcrumb.Item>{t("chat.breadcrumbs.chat")}</Breadcrumb.Item>
                <Breadcrumb.Item>{bot}</Breadcrumb.Item>
            </Breadcrumb>
            <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t("chat.input.placeholder")}
                onPressEnter={sendMessage}
                suffix={<MessageOutlined onClick={sendMessage} />}
            />
            <br />
            <br />
            <div style={{ background: "#fff", padding: 24, minHeight: 280 }}>
                {[...messages.current].reverse().map((message, i) => (
                <Comment
                    key={i}
                    author={<span>{message.issuer}</span>}
                    avatar={<Avatar icon={<UserOutlined />} />}
                    content={<p>{message.text}</p>}
                    datetime={
                        <Tooltip title={message.time}>
                        <span>
                            {moment(message.time, "YYYY-MM-DD HH:mm:ss")
                            .locale(i18n.languages[0])
                            .fromNow()}
                        </span>
                        </Tooltip>
                    }
                />
                ))}
            </div>
        </div>
    );
};

export default Chat;
