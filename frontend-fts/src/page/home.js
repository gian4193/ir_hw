import React, { useState, useEffect } from 'react';
import '@coreui/coreui/dist/css/coreui.min.css'
import './home.css';
import HomeService from './home.service';

export const Home = () => {
    const service = HomeService();
    const [data, setData] = useState([]);
    const [text, setText] = useState('');

    useEffect(() => {
        console.log(data);
    }, [data])

    const searchFullText = async () => {
        setData(await service.search(text));
    }

    return (
        <div className="main-layout">
            <div className="input-group mb-3">
                <input type="text" className="form-control" placeholder="input text you want to search" aria-describedby="button-addon2"
                    onChange={(e) => { setText(e.target.value); }}
                />
                <div className="input-group-append">
                    <button className="btn btn-outline-dark" type="button" id="button-addon2"
                        onClick={(e) => { searchFullText(); }}
                    >Search</button>
                </div>
            </div>
        </div>
    )
}