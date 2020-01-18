import React, { useState } from 'react';
import { Breadcrumb, Menu, Dropdown, Icon, Input, Comment, Spin } from 'antd';
import PieChart from '../components/charts/PieChart';
import axios from 'axios';

const { Search } = Input;

const Dashboard = () => {
    const [dataCrawler, setDataCrawler] = useState(null);
    const [replies, setReplies] = useState([]);
    const [classification, setClassification] = useState(null)

    const menu = (
        <Menu onClick={item => setDataCrawler(item.key)}>
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
                    setClassification(null);
                    setReplies(response.data)
                    if (response.data.length > 0) {
                        axios.post('http://localhost:5000/classify', {text: response.data, classifier: 'emotion'})
                        .then(response => {
                            let total = response.data.is_positve[0];
                            let positive = total.filter(label => label === 1);
                            let percentage = positive.length / total.length;
                            setClassification([percentage, 1 - percentage]);
                        })
                        .catch(error => console.warn(error));
                    }
                })
                .catch(error => console.warn(error));
            }}
        />;
    }

    let pieChart = null;
    if (classification === null && replies.length > 0) {
        pieChart = <Spin className="emotion-classifier-spinner" />
    } else if (classification) {
        pieChart = <PieChart 
            labels={['Positive', 'Negative']} 
            colors={['#00a854', '#f04134']} 
            headline="Emotion indicator" 
            data={classification} 
            className="emotion-pie-chart" />
    }
    
    return (
        <div className="info">
            <Breadcrumb style={{ margin: '16px 0' }}>
                <Breadcrumb.Item>Home</Breadcrumb.Item>
                <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
            </Breadcrumb>
            { dropdown }
            { crawler }
            { pieChart }
            { replies.map((reply, i) => <Comment key={i} content={<p>{reply}</p>} />) }
        </div>
    );
}

export default Dashboard;