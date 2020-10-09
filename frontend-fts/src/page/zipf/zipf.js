import React, { useEffect, useReducer, useState } from 'react'
import Axios from 'axios'
import { Route, useHistory, Switch } from 'react-router-dom';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import './zipf.css'
import { Button, Drawer, Table, Menu, Dropdown, Tabs } from 'antd'
import Search from 'antd/lib/input/Search'

const { TabPane } = Tabs;
export const Zipf = () => {
    const [url, setUrl] = useState('')
    const [s1, setS1] = useState(false)
    const [s2, setS2] = useState(false)
    const [s3, setS3] = useState(false)
    const [s4, setS4] = useState(false)
    const jump = (e) => {
        if (e.key === "whole_database_frequency") {
            setS2(false)
            setS3(false)
            setS4(false)
            setS1(true)
            setUrl(e.key)
        }
        else if (e.key === "stem_database_frequency") {
            setS3(false)
            setS1(false)
            setS4(false)
            setS2(true)
            setUrl(e.key)
        }
        else if (e.key === "origin_and_stem_frequency") {
            setS1(false)
            setS2(false)
            setS4(false)
            setS3(true)
        }
        else {
            setS1(false)
            setS2(false)
            setS3(false)
            setS4(true)
        }
    }
    const menu = () => {
        return (
            <Menu>
                <Menu.Item key="whole_database_frequency" onClick={jump}>whole_database</Menu.Item>
                <Menu.Item key="stem_database_frequency" onClick={jump}>stem_database</Menu.Item>
                <Menu.Item key="origin_and_stem_frequency" onClick={jump}>origin_and_stem</Menu.Item>
                <Menu.Item key="keyword_search_frequency" onClick={jump}>keyword_search</Menu.Item>
            </Menu>
        )

    }

    return (
        <div className='expand'>
            <Dropdown overlay={menu} placement="bottomCenter" arrow>
                <Button>bottomCenter</Button>
            </Dropdown>
            {/* <Switch>
                <Route exact path='/zipf' component={Whole_database}></Route>
            </Switch> */}
            {
                <Whole_database url={'whole_database_frequency'} show={s1} keyword={''}></Whole_database>
            }
            {
                <Whole_database url={'stem_database_frequency'} show={s2} keyword={''}></Whole_database>
            }
            {
                s3 && <Origin_and_stem></Origin_and_stem>
            }
            {
                s4 && <Keyword_search></Keyword_search>
            }

        </div>
    )
}


const Whole_database = (props) => {

    const [data, setData] = useState([])
    const [visible, setVisible] = useState(false)
    const [drawerdata, setDrawerdata] = useState([])
    useEffect(() => {
        console.log(props.url)
        load_data()
    }, [, props.keyword])


    const load_data = async () => {
        let d = (await Axios.get(`/full_text_search/${props.url}`)).data
        setData(d)
        console.log(d)
    }

    const customTooltip = (prop) => {
        const { active } = prop;
        if (active) {
            const { payload, label } = prop;
            //console.log(payload, label)
            if (payload == null) {
                return null;
            }
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
        props.show ?
            <div >
                <br></br>
                <Button type="primary" onClick={showDrawer}>
                    show top 100 words
            </Button>
                <LineChart width={1250} height={600} data={data}
                    margin={{ top: 20, bottom: 5, right: 10 }}>
                    <XAxis dataKey="index" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip content={customTooltip} />
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
                </Drawer>
            </div>
            :
            <div></div>
    )
}


const Origin_and_stem = () => {

    const [data, setData] = useState()
    useEffect(() => {
        load_data()
    }, [])

    const load_data = async () => {
        let d = (await Axios.get('/full_text_search/stem_and_origin_frequency')).data
        setData(d)
    }

    const customTooltip = (prop) => {
        const { active } = prop;
        if (active) {
            const { payload, label } = prop;
            if (payload == null) {
                return null;
            }
            return (
                <div className="container">
                    <p className="label">{`${label}`}</p>
                    <p style={{ color: '#8884d8' }}>{`${data[label].word} : ${data[label].number}`}</p>
                    <p style={{ color: '#82ca9d' }}>{`${data[label].stem_word} : ${data[label].stem_number}`}</p>
                </div>

            );
            // console.log(index, number, data[index].word)
        }
        return null;
    };

    const nullTooltip = () => {
        return null;
    }


    return (
        <div>
            <p>origin</p>
            <LineChart width={1250} height={300} data={data} syncId="anyId"
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="index" />
                <YAxis />
                <Tooltip content={customTooltip} />
                <Line type='monotone' dataKey='number' stroke='#8884d8' fill='#8884d8' />
            </LineChart>
            <p>after stem</p>
            <LineChart width={1250} height={300} data={data} syncId="anyId"
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="index" />
                <YAxis />
                <Tooltip content={nullTooltip} />
                <Line type='monotone' dataKey='stem_number' stroke='#82ca9d' fill='#82ca9d' />
            </LineChart>
        </div>

    )
}

const Keyword_search = () => {
    const [data, setData] = useState([])
    const [show, setShow] = useState(false)
    const [article, setArticle] = useState([])

    const columns = [
        { title: 'Title', dataIndex: 'title', key: 'title' }
    ]

    const load_data = async (keyword) => {
        let d = (await Axios.get('/full_text_search/spell_check/?word=' + keyword)).data
        console.log(d)
        setData(d[0].word)
        load_list_data(d[0].word)
    }
    const callback = (key) => {
        if (key === "2") {
            console.log(data)
            setShow(true)
        }
    }
    const load_list_data = async (keyword) => {
        let d = (await Axios.get('/full_text_search/keyword_zipf_list/?word=' + keyword)).data
        setArticle(d)
    }

    return (

        <div>
            <Search placeholder="input search text" onSearch={value => { load_data(value) }} enterButton />
            <br></br>
            <p style={{ fontSize: "12px" }}>以下為搜尋 {data} 的結果</p>
            <Tabs type="card" defaultActiveKey='1' onChange={callback}>
                <TabPane tab="article list" key="1" className='expand'>
                    <Table
                        columns={columns}
                        expandable={{
                            expandedRowRender: record => <p style={{ margin: 0 }}>{record.content}</p>
                        }}
                        dataSource={article}
                        expandRowByClick={true}
                        rowKey={article => article.title}
                    />
                </TabPane>
                <TabPane tab="zipf chart" key="2" style={{ width: '100%', height: '100%' }} className='expand'>
                    <Whole_database url={`keyword_zipf_chart/?word=${data}`} show={show} keyword={data}></Whole_database>
                </TabPane>
            </Tabs>
        </div>
    )
}
