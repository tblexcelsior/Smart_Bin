import {React} from "react";

export default function Spinner(props){
    return(
        <div className = "p">
            {props.id === 1 && <div className="loader"></div>}
            <div className = "status">{props.text}</div>
        </div>
    )
}