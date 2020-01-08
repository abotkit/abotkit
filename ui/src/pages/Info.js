import React from 'react';
import { Breadcrumb } from 'antd';

const Info = () => {
    return (
        <div className="info">
            <Breadcrumb style={{ margin: '16px 0' }}>
                <Breadcrumb.Item>Home</Breadcrumb.Item>
                <Breadcrumb.Item>Info</Breadcrumb.Item>
            </Breadcrumb>
            <h3>Abotkit is going to add ui functions soon</h3>
        </div>
    );
}

export default Chat;