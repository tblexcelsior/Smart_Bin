import './App.css';
import React from "react";
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export default function Chart(props){
    return(
    <div className="chart-box" onClick={() => props.toggle(props.id)}>
        <div className='chart-percent'>
            <CircularProgressbarWithChildren 
                value={props.percent} 
                styles={buildStyles({
                    pathColor: "#42f56f",
                    trailColor: "white"
                  })}
            >
                <img src={props.img_src} className='chart-img'/>
                <div className='chart-value'>{`${props.percent}%`}</div>
            </CircularProgressbarWithChildren >
        </div>
        <div className='garbage-type'>{props.g_type}</div>
    </div>
    )
}
