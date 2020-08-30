import React from 'react';
import { Comment, Avatar, Tooltip, message } from 'antd';
import { UserOutlined, RobotOutlined } from '@ant-design/icons';
import moment from 'moment';

import './Message.css';

const Message = ({ message, name }) => {
    
    let isSentByCurrentUser = false;

    if(name === 'Human') {
        isSentByCurrentUser = true
    }

    return (
        isSentByCurrentUser
        ? (
            <div className="messageContainer justifyEnd">
                <div>
                    <Comment className="messageText colorBlack"
                        author={<span>{ name }</span>}
                        avatar={<Avatar icon={<UserOutlined />} />}
                        content={<p>{ message.text }</p>}
                        datetime={
                        <Tooltip title={message.time}>
                            <span>{moment(message.time, 'YYYY-MM-DD HH:mm:ss').fromNow()}</span>
                        </Tooltip>
                        }
                    />
                </div>
            </div>
        )
        : (
            <div className="messageContainer justifyStart">
                <div >
                    <Comment className="messageText colorBlack "
                        author={<span>{ name }</span>}
                        avatar={<Avatar icon={<RobotOutlined />} />}
                        content={<p>{ message.text }</p>}
                        datetime={
                        <Tooltip title={message.time}>
                            <span>{moment(message.time, 'YYYY-MM-DD HH:mm:ss').fromNow()}</span>
                        </Tooltip>
                        }
                    />
                </div>
            </div>
        )
    )
};
export default Message;