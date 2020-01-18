import React, { useState, useEffect } from 'react';
import { Breadcrumb, Card } from 'antd';
import axios from 'axios';

const Crawler = () => {  
    const [crawler, setCrawler] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/data-crawler').then(response => {
            setCrawler(response.data);
          }).catch(error => {
            console.warn('abotkit rest api is not available', error);
          })        
    }, []);

    return (
        <>
            <Breadcrumb style={{ margin: '16px 0' }}>
                <Breadcrumb.Item>Home</Breadcrumb.Item>
                <Breadcrumb.Item>Crawler</Breadcrumb.Item>
            </Breadcrumb>
            <h1>Available Data Crawler</h1>
            { crawler.map((dataCrawler, i) => {
                let title = <div>{dataCrawler.name}</div>
                return(
                    <Card 
                        title={title} 
                        key={i} 
                        style={{ width: '100%', marginBottom: 15 }}>
                        <p>{dataCrawler.description}</p>
                    </Card>
                )
            })}
 
        </>
    );
}

export default Crawler;