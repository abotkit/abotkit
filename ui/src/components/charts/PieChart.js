import React, { useRef, useEffect } from 'react';
import Chart from 'chart.js';

const PieChart = props => {
  const canvas = useRef()
  const chart = useRef(null)

  useEffect(() => {
    if (chart.current) {
      chart.current.destroy();
    }

    chart.current = new Chart(canvas.current, { 
      type: 'pie',
      data: {
        labels: props.labels,
        datasets: [{
          label: props.headline,
          data: props.data,
          backgroundColor: props.colors
        }]
      }
    });
  }, [props.labels, props.headline, props.colors, props.data])

  return <canvas className={props.className} ref={canvas} />
}

export default PieChart;