import React, { useState, useRef, useEffect, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useParams, useHistory } from 'react-router-dom';
import { Breadcrumb, Input } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import Smartphone from '../components/Chat/Smartphone';
import axios from 'axios';
import { useTranslation } from "react-i18next";
import moment from 'moment';
import SettingsContext from '../SettingsContext';
import 'moment/locale/de';
import 'moment/locale/en-gb';

import { createUseStyles } from 'react-jss';

const useStyle = createUseStyles({
    display: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")'
    },
    messages: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        color: '#303030',
        overflow: 'scroll'
    },
    message: {
        display: 'flex',
        flexDirection: 'column',
        margin: 12,
        padding: '0 12px',
        width: 'fit-content',
        position: 'relative',
        borderRadius: 6,
        '& p': {
            margin: 0,
            paddingTop: 6
        },
        '& span': {
            fontSize: '0.65rem',
            textAlign: 'end'
        }
    },
    human: {
        background: 'white',
        borderTopLeftRadius: 0,
        '&:after': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: 0,
            width: 0,
            height: 0,
            border: '8px solid transparent',
            borderLeft: 0,
            borderTop: 0,
            borderRightColor: 'white',
            marginLeft: -8
        }
    },
    bot: {
        alignSelf: 'flex-end',
        borderTopRightRadius: 0,
        background: '#dcf8c6',
        '&:after': {
            content: '""',
            position: 'absolute',
            right: 0,
            top: 0,
            width: 0,
            height: 0,
            border: '8px solid transparent',
            borderRight: 0,
            borderTop: 0,
            borderLeftColor: '#dcf8c6',
            marginRight: -8
        }
    },
    input: {
        borderRadius: 12,
        margin: 12,
        borderColor: 'unset !important',
        outline: '0 !important',
        boxShadow: 'unset !important',
        border: 'none',
        width: 'calc(100% - 24px)'
    }
});

const Chat = () => {
    const { t, i18n } = useTranslation();
    const [text, setText] = useState('');
    const { bot } = useParams();
    const history = useHistory();
    const [, updateState] = React.useState();
    const forceUpdate = React.useCallback(() => updateState({}), []);
    const messages = useRef([]);
    const settings = useContext(SettingsContext);
    const [chatIdentifier] = useState(uuidv4());

    const classes = useStyle();
    const messagebox = useRef();

    
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
            messagebox.current.scrollTop = messagebox.current.scrollHeight;
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
        messagebox.current.scrollTop = messagebox.current.scrollHeight;
    }

    return (
        <>
            <Breadcrumb style={{ margin: "16px 0" }}>
                <Breadcrumb.Item>{t("chat.breadcrumbs.home")}</Breadcrumb.Item>
                <Breadcrumb.Item>{t("chat.breadcrumbs.chat")}</Breadcrumb.Item>
                <Breadcrumb.Item>{bot}</Breadcrumb.Item>
            </Breadcrumb>

            <Smartphone>
                <div className={classes.display} >
                    <div ref={messagebox} className={classes.messages}>
                        {messages.current.map((message, i) => (
                        <div key={i} className={`${classes.message} ${message.issuer === bot ? classes.bot : classes.human}`}>
                            <p>{message.text}</p>
                            <span>{moment().locale(i18n.languages[0]).format('HH:mm')}</span>
                        </div>
                        ))}
                    </div>
                    <Input
                    className={classes.input}
                    value={text}
                    onPressEnter={sendMessage}
                    onChange={e => setText(e.target.value)} 
                    placeholder={t("chat.input.placeholder")}
                    suffix={<MessageOutlined onClick={sendMessage} />}/>
                </div>
            </Smartphone>
        </>
    );
};

export default Chat;
