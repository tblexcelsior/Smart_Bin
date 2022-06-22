import { React, useState, useEffect } from "react";
import axios from 'axios'
import './App.css'
import Exit from '../image/reject.png'
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default function TotalTable(props){
    const [mode, setMode] = useState(1)
    const [dayData, setDayData] = useState([0, 0, 0, 0]);
    const [monthData, setMonthData] = useState([0, 0, 0, 0]);



    useEffect(() => {
        if (mode === 1){
            async function fetchData(){
                let res = await axios({
                    method: 'get',
                    url: 'http://localhost:4000/day',
                })
                var values = Object.values(res['data']);

                setDayData(() => {
                    const newData = [];
                    for (let i = 0; i < values.length; i++){
                        const data = values[i]['total']
                        newData.push(data)
                    }
                    return newData;
                })
            }
        fetchData()
        }
        else{
            async function fetchData(){
                let res = await axios({
                    method: 'get',
                    url: 'http://localhost:4000/month',
                })
                var values = Object.values(res['data']);
                setMonthData(() => {
                    const newData = [];
                    for (let i = 0; i < values.length; i++){
                        const data = values[i]['total']
                        newData.push(data)
                    }
                    return newData;
                })
            }
        fetchData()
        }
        }
        , [mode])
    var BarChart = () => {
               return (<Bar 
                    data={{
                    labels: [
                        'Bottle',
                        'Can',
                        'Other',
                        'Paper'
                    ],
                    datasets:[
                        {
                            label: [
                                'Total Count Value'
                            ],
                            backgroundColor: [
                                "#3e95cd",
                                "#8e5ea2",
                                "#3cba9f",
                                "#e8c3b9"
                            ],
                            data: mode===1 ? dayData : monthData
                        },
                    ]
                }}
                />)};

    function modeToggle(){
        setMode(prevMode => {
            var newMode;
            if(prevMode===1){
                newMode = 2;
            }
            else{
                newMode = 1;
            }
            return newMode
        })
    }

    return(
        <div className="table-bounding-box">
            <div className="detail-table">
                <div className="table-header">
                    <h1>Statistics</h1>
                    <div className="mode-select" onClick={modeToggle}>
                        {mode === 1 
                        ? 
                            <>
                                <div className="mode-div chosen-type">Day</div> 
                                <div className="mode-div">Month</div>
                            </>
                        :
                            <>
                                <div className="mode-div">Day</div> 
                                <div className="mode-div chosen-type">Month</div>
                            </>
                        }
                    </div>
                    <div className="table-button" onClick={props.handleToggle}>
                        <img src={Exit} className="exit-button"/>
                    </div>
                </div>
                <div className="table-content">
                    <BarChart />
                </div>
            </div>
        </div>
    )
}