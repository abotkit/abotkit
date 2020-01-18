import React, { useState, useEffect } from 'react';
import { Breadcrumb, Card } from 'antd';
import axios from 'axios';

const Classifier = () => {  
    const [classifier, setClassifier] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/classifier').then(response => {
            setClassifier(response.data);
          }).catch(error => {
            console.warn('abotkit rest api is not available', error);
          })        
    }, []);

    return (
        <>
            <Breadcrumb style={{ margin: '16px 0' }}>
                <Breadcrumb.Item>Home</Breadcrumb.Item>
                <Breadcrumb.Item>Classifier</Breadcrumb.Item>
            </Breadcrumb>
            <h1>Available Classifier</h1>
            { classifier.map((availableClassifier, i) => {
                let title = <div>{availableClassifier.name}</div>
                return(
                    <Card 
                        title={title} 
                        key={i} 
                        style={{ width: '100%', marginBottom: 15 }}>
                        <p>{availableClassifier.description}</p>
                    </Card>
                )
            })}
 
        </>
    );
}

export default Classifier;