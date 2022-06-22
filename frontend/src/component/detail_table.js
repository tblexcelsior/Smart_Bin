import { React, useState, useEffect } from "react";
import axios from 'axios'
import './App.css'
import Exit from '../image/reject.png'
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default function DetailTable(props){
    const [mode, setMode] = useState(1)
    const [dayData, setDayData] =  useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    const [monthData, setMonthData] =  useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    const hourLabel = ['8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'];
    const hourColor = ['#f55442', '#f59c42', '#0f5387', '#f59c42', '#42f590', '#45f7ee', '#45aaf7', '#a4aeba', '#2232c7', '#5027c2', '#a11ab0', '#9c1a41']
    const monthLabel = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    const monthColor = ['#f55442', '#f59c42', '#cc0e21', '#0f5387', '#f59c42', '#42f590', '#45f7ee', '#45aaf7', '#a4aeba', '#2232c7', '#5027c2', '#a11ab0', '#9c1a41']
    const type = String(props.name).toLowerCase();
    function modeToggle(){
        setMode(prevMode => {
            var newMode;
            if (mode === 1){
                newMode = 0;
            }
            else{
                newMode = 1;
            }
            return newMode
        })
    }
    useEffect(() => {
        async function fetchData(){
            if (mode === 1){
                let res = await axios({
                    method: 'get',
                    url: 'http://localhost:4000/day/category',
                })
                var values = Object.values(res['data']);
                // console.log(values);
                setDayData(() =>
                    {  
                        const newArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                        for (let i = 0; i < values.length; i++){
                            const val = values[i]
                            if (type.localeCompare(val['g_type'])){
                                continue
                            }
                            else{
                                const idx = Number(val['hour'] - 8)
                                newArray[idx] = val['total']
                            }
                        }
                        return newArray;
                    }
                )
            }
            else{
                let res = await axios({
                    method: 'get',
                    url: 'http://localhost:4000/month/category',
                })
                var values = Object.values(res['data']);
                setMonthData(() =>
                    {  
                        const newArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                        for (let i = 0; i < values.length; i++){
                            const val = values[i]
                            if (val['g_type'].localeCompare(type)){
                                const idx = Number(val['month'])
                                console.log(typeof(val['total']))
                                newArray[idx] = val['total']
                            }
                        }
                        return newArray;
                    }
                )
            }
        }
        fetchData()
        }
        , [mode])

    const BarChart = () => {
        return(
            <Bar 
                data={{
                    labels: mode === 1 ? hourLabel : monthLabel,
                    datasets: [
                        {
                            label: ['Total Count Value'],
                            backgroundColor: mode === 1 ? hourColor : monthColor,
                            data: mode === 1 ? dayData : monthData
                        }
                    ]
                }}
            />
        )
    }

    return(
        <div className="table-bounding-box">
            <div className="detail-table">
                <div className="table-header">
                    <h1>{props.name} Statistics</h1>
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