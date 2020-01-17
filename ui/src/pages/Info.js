import React, { useState } from 'react';
import { Breadcrumb, Menu, Dropdown, Icon, Input, Comment } from 'antd';
import axios from 'axios';

const { Search } = Input;

const Info = () => {
    const [dataCrawler, setDataCrawler] = useState(null);
    const [replies, setReplies] = useState([]);
    const [summary, setSummary] = useState(null)

    const menu = (
        <Menu onClick={item => {
            console.log(item)
            setDataCrawler(item.key)
        }}>
          <Menu.Item key="twitter">
            <span>Twitter</span>
          </Menu.Item>
        </Menu>
    );

    let dropdown = <div className="crawler-selector">
                        <span>Please select a </span>
                        <Dropdown overlay={menu}>
                            <span className="ant-dropdown-link">
                            data crawler <Icon type="down" />
                            </span>
                        </Dropdown>
                        <span> from this dropdown menu first</span>
                    </div>;
    
    let crawler = null;
    if (dataCrawler) {
        dropdown =  <div className="crawler-selector">
                        <span>You've selected the </span>
                        <Dropdown overlay={menu}>
                            <span className="ant-dropdown-link">
                            {dataCrawler} <Icon type="down" />
                            </span>
                        </Dropdown>
                        <span> data crawler</span>
                    </div>;
        crawler = <Search
            placeholder="insert a tweet url"
            enterButton
            onSearch={url => {
                axios.post('http://localhost:5000/crawl', {url: url, crawler: dataCrawler})
                .then(response => {
                    setReplies(response.data)
                    if (response.data.length > 0) {
                        axios.post('http://localhost:5000/classify', {text: response.data, classifier: 'emotion'})
                        .then(classification => {
                            console.log(classification.data);
                            setSummary(classification.data)
                        })
                        .catch(error => console.warn(error));
                    }
                })
                .catch(error => console.warn(error));
            }}
        />;
    }
    
    return (
        <div className="info">
            <Breadcrumb style={{ margin: '16px 0' }}>
                <Breadcrumb.Item>Home</Breadcrumb.Item>
                <Breadcrumb.Item>Info</Breadcrumb.Item>
            </Breadcrumb>
            { dropdown }
            { crawler }
            { replies.map((reply, i) => <Comment key={i} content={<p>{reply}</p>} />) }
        </div>
    );
}

export default Info;