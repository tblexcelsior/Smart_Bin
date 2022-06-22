import './App.css';
import Chart from './chart'
import DetailTable from './detail_table';
import TotalTable from './total_table';
import Spinner from './wait-spinner';
import Bottle from '../image/water.png';
import Can from '../image/soda.png';
import Paper from '../image/paper.png';
import Other from '../image/stink.png';
import axios from 'axios'
import React, { useState, useEffect, useMemo } from 'react';

function App() {
  const [chosenType, setChosenType] = useState(0);
  const [statistic, setStatistic] = useState(false)
  const [processing, setProcessing] = useState(0)

  const typeName = ['Paper', 'Bottle', 'Can', 'Other'];
  // Div data
  const [data, setData] = useState([
                              {
                                id:1,
                                type:"Paper",
                                percent: 0,
                                image: Paper
                                    },
                              {
                                id:2,
                                type:"Bottle",
                                percent: 0,
                                image: Bottle
                              },
                              {
                                id:3,
                                type:"Can",
                                percent: 0,
                                image: Can
                              },
                              {
                                id:4,
                                type:"Other",
                                percent: 0,
                                image: Other
                              }
                            ]);
  // Signal to update data
  const [updateAlert, setUpdateAlert] = useState(1)

  setInterval(()=>{
    setUpdateAlert(prevData => {
        var newData;
        if (prevData === 1){
        newData = 0;
      }
      else{
        newData = 1;
      }
      return newData
    })
  
  }, 20000);

  useEffect(() => {
    async function fetchData(){
      let res = await axios({
          method: 'get',
          url: 'http://localhost:4000/percent',
      })
      var values = Object.values(res['data']['0']);
      setData(prevData => {
        const newData = []
        for (let i = 0; i < prevData.length; i++){
          const currentData = prevData[i]
          const updatedData = {
            ...currentData,
            percent: values[i+1]
          }
          newData.push(updatedData)
        }
        return newData;
      })
    };
    fetchData();
  }, [updateAlert])
  
  useEffect(() =>{
    async function fetchData(){
        let res = await axios({
            method: 'get',
            url: 'http://localhost:4000/processing',
        })
        var values = Object.values(res['data']['0'])[0];
        setProcessing(values)
        };
        fetchData();
    }, [updateAlert])


  function toggle(id){
    setChosenType(id)
    setStatistic(false)
  }
  function statisticToggle(){
    setStatistic(true)
    setChosenType(0)
  }

  function exitButton(){
    setChosenType(0)
    setStatistic(false)
  }
  
  const chartElements = useMemo(() => data.map(p => {
    return <Chart key={p.id} id={p.id} img_src={p.image} g_type={p.type} percent={p.percent} toggle={toggle}/>
  }))

  
  return (
    <div className="App">
    
      <Spinner id = {processing} text={processing===1 ? 'Processing...' : 'Ready!'}/>
      <div className='chart-group'>
        {chartElements}
      </div>
      <div className='statistic-button' onClick={statisticToggle}>Statistics</div>
      {chosenType !== 0  && <DetailTable handleToggle={exitButton} name={typeName[chosenType - 1]}/>}
      {statistic === true  && <TotalTable handleToggle={exitButton} />}

    </div>
  );
}

export default App;
