import React from 'react';
import { Comment, Avatar, Tooltip } from 'antd';
import { UserOutlined, RobotOutlined } from '@ant-design/icons';
import moment from 'moment';
import './Message.css'

class ChatViewComponent extends React.Component {

    componentDidMount = () => {
        const container = document.getElementById('chatview-container');
        if(container)
        container.scrollTo(0, container.scrollHeight);
    }
    componentDidUpdate = () => {
        const container = document.getElementById('chatview-container');
        if(container)
        container.scrollTo(0, container.scrollHeight);
    }
    
    render() {
        
        const { message } = this.props
        
        console.log(typeof message.issuer);

        if(message.issuer === 'Human') {
            return (
                    <div className="messageContainer justifyEnd">
                        <div>
                            <Comment className="messageText colorBlack"
                                author={<span>{ message.issuer }</span>}
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
            } else { 
                return (
                    <div className="messageContainer justifyStart" id='chatview-container'>
                        <div>
                            <Comment className="messageText colorBlack "
                                author={<span>{ message.issuer }</span>}
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
        };
    }
}

export default ChatViewComponent;