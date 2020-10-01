import React, { useEffect, useReducer, useState } from 'react'
import Axios from 'axios'
import { Route, useHistory, Switch } from 'react-router-dom';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import './zipf.css'
import { Button, Drawer, Table, Menu, Dropdown } from 'antd'

export const Zipf = () => {
    let his = useHistory()
    const jump = (e) => { his.push(e.key) }
    const menu = () => {
        return (
            <Menu>
                <Menu.Item key='/whole_database' onClick={jump}>whole_database</Menu.Item>
            </Menu>
        )

    }

    return (
        <div>
            <Dropdown overlay={menu} placement="bottomCenter" arrow>
                <Button>bottomCenter</Button>
            </Dropdown>
            <Switch>
                <Route exact path='/whole_database' component={Whole_database}></Route>
            </Switch>
        </div>
    )
}


const Whole_database = () => {

    const [data, setData] = useState([])
    const [visible, setVisible] = useState(false)
    const [drawerdata, setDrawerdata] = useState([])
    useEffect(() => {
        console.log("in whole_database")
        load_data()
    }, [])

    const load_data = async () => {
        let d = (await Axios.get('/full_text_search/whole_database_frequency')).data
        setData(d)
    }

    const customTooltip = (prop) => {
        const { active } = prop;
        if (active) {
            const { payload, label } = prop;
            return (
                <div className="container">
                    <p className="label">{`${data[label].word} : ${label}`}</p>
                    {/* <p className="intro">{data[index].word}</p> */}
                </div>

            );
            // console.log(index, number, data[index].word)
        }
        return null;
    };




    const column = [
        { title: 'index', dataIndex: 'index' },
        { title: 'word', dataIndex: 'word' },
        { title: 'occurence', dataIndex: 'number' }
    ]

    const showDrawer = () => {
        setVisible(true)
        setDrawerdata(data.slice(0, 101))
    };
    const onClose = () => {
        setVisible(false)
    };


    return (

        <div >
            <p>test</p>

            {/* <br></br>
            <Button type="primary" onClick={showDrawer}>
                show top 100 words
            </Button>
            <LineChart width={1250} height={600} data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="index" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip content={customTooltip} />
                <Legend />
                <Line type="monotone" dataKey="number" stroke="#82ca9d" />
            </LineChart>
            <Drawer
                title="top 100 words"
                placement="bottom"
                closable={false}
                onClose={onClose}
                visible={visible}
                height={500}
            >
                <Table columns={column} dataSource={drawerdata} size="small" />
            </Drawer> */}
        </div>
    )
}
