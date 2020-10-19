import React, { useEffect, useReducer, useState, useRef } from 'react'
import Axios from 'axios'
import { Route, useHistory, Switch } from 'react-router-dom';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ComposedChart, Scatter } from 'recharts';
import './zipf.css'
import { Button, Drawer, Table, Menu, Dropdown, Tabs, Row, Col, Input, Space } from 'antd'
import Search from 'antd/lib/input/Search'
import { FlexHorizon } from '../../component/FlexHorizon'
import '../home.css'
import { SearchOutlined } from '@ant-design/icons';

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
            <Row>
                <Col span={3} >
                    {/* <Dropdown overlay={menu} placement="bottomCenter" arrow>
                        <Button>bottomCenter</Button>
                    </Dropdown> */}
                    <Menu
                        defaultSelectedKeys={['keyword_search_frequency']}
                        mode="inline"
                        theme="light"

                    >
                        <Menu.Item key="whole_database_frequency" onClick={jump}>whole_database</Menu.Item>

                        <Menu.Item key="stem_database_frequency" onClick={jump}>stem_database</Menu.Item>

                        <Menu.Item key="keyword_search_frequency" onClick={jump}>keyword_search</Menu.Item>
                        <Menu.Item key="origin_and_stem_frequency" onClick={jump}>analysis</Menu.Item>
                        <Menu.Item key="1" ></Menu.Item>
                        <Menu.Item key="1" ></Menu.Item>
                        <Menu.Item key="1" ></Menu.Item>
                        <Menu.Item key="1" ></Menu.Item>
                        <Menu.Item key="1" ></Menu.Item>
                        <Menu.Item key="1" ></Menu.Item>
                        <Menu.Item key="1" ></Menu.Item>
                        <Menu.Item key="1" ></Menu.Item>
                        <Menu.Item key="1" ></Menu.Item>
                        <Menu.Item key="1" ></Menu.Item>

                    </Menu>
                </Col>
                <Col span={21} >
                    {
                        <div style={{ margin: '0% 2%' }}>
                            <Whole_database url={'whole_database_frequency'} show={s1} keyword={''} ></Whole_database>
                        </div>
                    }
                    {
                        <div style={{ margin: '0% 2%' }}>
                            <Whole_database url={'stem_database_frequency'} show={s2} keyword={''}></Whole_database>
                        </div>
                    }
                    {
                        s3 && <Analysis></Analysis>
                    }
                    {

                        s4 && <Keyword_search></Keyword_search>

                    }

                </Col>
            </Row>

            {/* <Switch>
                <Route exact path='/zipf' component={Whole_database}></Route>
            </Switch> */}


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

const Compare_picture = (props) => {
    const [data, setData] = useState([])
    useEffect(() => {
        setData([...props.word])
        console.log([...props.word])
    }, [, props.word])
    // const load_data = async () => {
    //     let d = (await Axios.get('/full_text_search/keyword_zipf_chart/?word=' + props.keyword)).data;
    //     setData(d)
    //     console.log(d)

    // }
    const nullTooltip = () => {
        return null;
    }

    const customTooltip = (prop) => {
        const { active } = prop;
        if (active) {
            const { payload, label } = prop;
            if (payload == null) {
                return null;
            }
            return (
                <div className="container ">
                    <p className="label">{`${data[label].word}`}</p>
                    <p style={{ color: '#8884d8', margin: '1px' }}>{`index : ${data[label].index}`}</p>
                    <p style={{ color: '#82ca9d', margin: '1px' }}>{`index : ${data[label].rank}/45488`}</p>

                </div>

            );
            // console.log(index, number, data[index].word)
        }
        return null;
    };

    return (
        props.show ?
            <div>

                <LineChart width={1250} height={300} data={data} syncId="anyId"
                    margin={{ top: 20, bottom: 5, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="index" />
                    <YAxis />
                    <Tooltip content={customTooltip} />
                    <Line type='monotone' dataKey='number' stroke='#8884d8' />
                </LineChart>
                <LineChart width={1250} height={300} data={data} syncId="anyId"
                    margin={{ top: 20, bottom: 5, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="index" />
                    <YAxis />
                    <Tooltip content={nullTooltip} />
                    <Line type='monotone' dataKey='whole' stroke='#82ca9d' />
                </LineChart>
            </div>
            :
            <div></div>
    )
}

const Analysis_pic = (props) => {
    const [top, setTop] = useState([])
    const [school, setSchool] = useState([])
    const [market, setMarket] = useState([])
    const [medium, setMedium] = useState([])
    const [three, setThree] = useState([])
    const [two, setTwo] = useState([])
    const [bottom, setBottom] = useState([])
    const [data, setData] = useState([])
    const [bottomtwo, setBottomtwo] = useState([])
    useEffect(() => {
        setData([...props.datas].slice(0, 301))
        setSchool([...props.school])
        setMarket([...props.market])
        setMedium([...props.datas].slice(301, 872))
        setThree([...props.datas].slice(872, 1191))
        setTwo([...props.datas].slice(1191, 1790))
        setBottom([...props.datas].slice(1791, 2776))
        setBottomtwo([...props.datas].slice(2776, 3758))
        console.log([...props.school])
    }, [, props.datas, props.school, props.market])


    const customTooltip = (prop) => {
        const { active } = prop;
        if (active) {
            const { payload, label } = prop;
            if (payload == null) {
                return null;
            }
            return (
                <div className="container ">
                    <p className="label">{`${data[label].word}`}</p>
                    <p style={{ color: 'blue', margin: '1px' }}>{`market : ${data[label].index} , ${data[label].number}`}</p>
                    <p style={{ color: 'red', margin: '1px' }}>{`school : ${data[label].compare_index} , ${data[label].compare_freq}`}</p>

                </div>

            );
            // console.log(index, number, data[index].word)
        }
        return null;
    }
    const mediumcustomTooltip = (prop) => {
        const { active } = prop;
        if (active) {
            const { payload, label } = prop;
            if (payload == null) {
                return null;
            }
            return (
                <div className="container ">
                    <p className="label">{`${medium[label - 301].word}`}</p>
                    <p style={{ color: 'blue', margin: '1px' }}>{`market : ${medium[label - 301].index} , ${medium[label - 301].number}`}</p>
                    <p style={{ color: 'red', margin: '1px' }}>{`school : ${medium[label - 301].compare_index} , ${medium[label - 301].compare_freq}`}</p>

                </div>

            );
            // console.log(index, number, data[index].word)
        }
        return null;
    }
    const threecustomTooltip = (prop) => {
        const { active } = prop;
        if (active) {
            const { payload, label } = prop;
            if (payload == null) {
                return null;
            }
            return (
                <div className="container ">
                    <p className="label">{`${three[label - 872].word}`}</p>
                    <p style={{ color: 'blue', margin: '1px' }}>{`market : ${three[label - 872].index} , ${three[label - 872].number}`}</p>
                    <p style={{ color: 'red', margin: '1px' }}>{`school : ${three[label - 872].compare_index} , ${three[label - 872].compare_freq}`}</p>

                </div>

            );
            // console.log(index, number, data[index].word)
        }
        return null;
    }
    const twocustomTooltip = (prop) => {
        const { active } = prop;
        if (active) {
            const { payload, label } = prop;
            if (payload == null) {
                return null;
            }
            return (
                <div className="container ">
                    <p className="label">{`${two[label - 1191].word}`}</p>
                    <p style={{ color: 'blue', margin: '1px' }}>{`market : ${two[label - 1191].index} , ${two[label - 1191].number}`}</p>
                    <p style={{ color: 'red', margin: '1px' }}>{`school : ${two[label - 1191].compare_index} , ${two[label - 1191].compare_freq}`}</p>

                </div>

            );
            // console.log(index, number, data[index].word)
        }
        return null;
    }

    const bottomcustomTooltip = (prop) => {
        const { active } = prop;
        if (active) {
            const { payload, label } = prop;
            if (payload == null) {
                return null;
            }
            return (
                <div className="container ">
                    <p className="label">{`${bottom[label - 1791].word}`}</p>
                    <p style={{ color: 'blue', margin: '1px' }}>{`market : ${bottom[label - 1791].index} , ${bottom[label - 1791].number}`}</p>
                    <p style={{ color: 'red', margin: '1px' }}>{`school : ${bottom[label - 1791].compare_index} , ${bottom[label - 1791].compare_freq}`}</p>

                </div>

            );
            // console.log(index, number, data[index].word)
        }
        return null;
    }
    const bottomtwocustomTooltip = (prop) => {
        const { active } = prop;
        if (active) {
            const { payload, label } = prop;
            if (payload == null) {
                return null;
            }
            return (
                <div className="container ">
                    <p className="label">{`${bottom[label - 2776].word}`}</p>
                    <p style={{ color: 'blue', margin: '1px' }}>{`market : ${bottom[label - 2776].index} , ${bottom[label - 2776].number}`}</p>
                    <p style={{ color: 'red', margin: '1px' }}>{`school : ${bottom[label - 2776].compare_index} , ${bottom[label - 2776].compare_freq}`}</p>

                </div>

            );
            // console.log(index, number, data[index].word)
        }
        return null;
    }



    return (
        props.show ?
            <div>
                <LineChart
                    width={1250}
                    height={300}
                    data={market}
                    margin={{
                        top: 20, right: 80, bottom: 20, left: 20,
                    }}>
                    <CartesianGrid stroke="#f5f5f5" />
                    <Legend />

                    <XAxis dataKey="index" />
                    <YAxis />
                    <Line dataKey="number" stroke="red" type='monotone' dot={false} />


                </LineChart>
                <LineChart
                    width={1250}
                    height={300}
                    data={school}
                    margin={{
                        top: 20, right: 80, bottom: 20, left: 20,
                    }}>
                    <CartesianGrid stroke="#f5f5f5" />
                    <Legend />

                    <XAxis dataKey="index" />
                    <YAxis />
                    <Line dataKey="number" stroke="red" type='monotone' />


                </LineChart>
                <LineChart
                    width={1250}
                    height={600}
                    data={data}
                    margin={{
                        top: 20, right: 80, bottom: 20, left: 20,
                    }}
                >
                    <CartesianGrid stroke="#f5f5f5" />
                    <Tooltip content={customTooltip} />
                    <Legend />

                    <XAxis dataKey="index" />
                    <YAxis />
                    <Line dataKey="compare_freq" stroke="red" type='monotone' />
                    <Line dataKey="number" stroke="blue" type='monotone' />
                </LineChart>
                <LineChart
                    width={1250}
                    height={600}
                    data={medium}
                    margin={{
                        top: 20, right: 80, bottom: 20, left: 20,
                    }}
                >
                    <CartesianGrid stroke="#f5f5f5" />
                    <Tooltip content={mediumcustomTooltip} />
                    <Legend />

                    <XAxis dataKey="index" />
                    <YAxis />
                    <Line dataKey="compare_freq" stroke="red" type='monotone' />
                    <Line dataKey="number" stroke="blue" type='monotone' />
                </LineChart>
                <LineChart
                    width={1250}
                    height={600}
                    data={three}
                    margin={{
                        top: 20, right: 80, bottom: 20, left: 20,
                    }}
                >
                    <CartesianGrid stroke="#f5f5f5" />
                    <Tooltip content={threecustomTooltip} />
                    <Legend />

                    <XAxis dataKey="index" />
                    <YAxis />
                    <Line dataKey="compare_freq" stroke="red" type='monotone' />
                    <Line dataKey="number" stroke="blue" type='monotone' />
                </LineChart>
                <LineChart
                    width={1250}
                    height={600}
                    data={two}
                    margin={{
                        top: 20, right: 80, bottom: 20, left: 20,
                    }}
                >
                    <CartesianGrid stroke="#f5f5f5" />
                    <Tooltip content={twocustomTooltip} />
                    <Legend />

                    <XAxis dataKey="index" />
                    <YAxis />
                    <Line dataKey="compare_freq" stroke="red" type='monotone' />
                    <Line dataKey="number" stroke="blue" type='monotone' />
                </LineChart>
                <LineChart
                    width={1250}
                    height={600}
                    data={bottom}
                    margin={{
                        top: 20, right: 80, bottom: 20, left: 20,
                    }}
                >
                    <CartesianGrid stroke="#f5f5f5" />
                    <Tooltip content={bottomcustomTooltip} />
                    <Legend />

                    <XAxis dataKey="index" />
                    <YAxis />
                    <Line dataKey="compare_freq" stroke="red" type='monotone' />
                    <Line dataKey="number" stroke="blue" type='monotone' />
                </LineChart>
                <LineChart
                    width={1250}
                    height={600}
                    data={bottomtwo}
                    margin={{
                        top: 20, right: 80, bottom: 20, left: 20,
                    }}
                >
                    <CartesianGrid stroke="#f5f5f5" />
                    <Tooltip content={bottomtwocustomTooltip} />
                    <Legend />

                    <XAxis dataKey="index" />
                    <YAxis />
                    <Line dataKey="compare_freq" stroke="red" type='monotone' />
                    <Line dataKey="number" stroke="blue" type='monotone' />
                </LineChart>
            </div>
            :
            <div></div>
    )
}

const Analysis_screening = (props) => {
    const [data, setData] = useState([])
    useEffect(() => {
        setData([...props.datas])
        console.log(...props.datas)
    }, [, props.datas])

    return (
        props.show ?
            <div>
                <LineChart
                    width={1250}
                    height={600}
                    data={data}
                    margin={{
                        top: 20, right: 80, bottom: 20, left: 20,
                    }}>
                    <CartesianGrid stroke="#f5f5f5" />
                    <Legend />

                    <XAxis dataKey="index" />
                    <YAxis />
                    <Line dataKey="fever_number" stroke="red" type='monotone' dot={false} />
                    <Line dataKey="fatigue_number" stroke="blue" type='monotone' dot={false} />
                    <Line dataKey="diabetes_number" stroke="green" type='monotone' dot={false} />
                </LineChart>
            </div>
            :
            <div></div>
    )

}

const Analysis = () => {
    const [data, setData] = useState([])
    const [show, setShow] = useState(false)

    useEffect(() => {
        load_data()
    }, [])




    const load_data = async () => {
        let d = (await Axios.get('/full_text_search/screening')).data
        setData(d)
        console.log(d)
    }

    const callback = (key) => {
        if (key === "1") {
            console.log(data)
            setShow(true)
        }
    }
    return (
        <div style={{ margin: '1%' }}>
            <br></br>
            <Tabs type="card" defaultActiveKey='1' onChange={callback}>
                <TabPane tab="zipf chart" key="1" style={{ width: '100%', height: '100%' }} className='expand'>
                    <Analysis_screening show={show} datas={data} ></Analysis_screening>
                </TabPane>
            </Tabs>

        </div>
    )
}




const Keyword_search = () => {
    const [data, setData] = useState([])
    const [show, setShow] = useState(false)
    const [word_arr, setWord_arr] = useState([])
    const [stem_arr, setStem_arr] = useState([])
    const [article, setArticle] = useState([])
    const [table, setTable] = useState({
        searchText: '',
        searchedColumn: '',
    })

    const columns = [
        { title: 'Title', dataIndex: 'title', key: 'title' }
    ]
    const searchInput = useRef(null);

    const getColumnSearchProps = dataIndex => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
          </Button>
                    <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                        Reset
          </Button>
                </Space>
            </div>
        ),
        filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilter: (value, record) =>
            record[dataIndex]
                ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
                : '',
        onFilterDropdownVisibleChange: visible => {
            if (visible) {
                setTimeout(() => searchInput.current.select());
            }
        },
    });




    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setTable({
            searchText: selectedKeys[0],
            searchedColumn: dataIndex,
        });
    };

    const handleReset = clearFilters => {
        clearFilters();
        setTable({ searchText: '' });
    };


    const word_columns = [
        {
            title: 'Word',
            dataIndex: 'word',
            dataIndex: 'word',
            key: 'word',
            ...getColumnSearchProps('word')

        },
        {
            title: 'subset index',
            dataIndex: 'index',
            width: '15%',

        },
        {
            title: 'subset occurence',
            dataIndex: 'number',
            width: '15%',

        },
        {
            title: 'index',
            dataIndex: 'rank',
            width: '15%',

        },
        {
            title: 'occurence',
            dataIndex: 'whole',
            width: '15%',

        },

    ];

    const load_data = async (keyword) => {
        let d = (await Axios.get('/full_text_search/spell_check/?word=' + keyword)).data
        console.log(d)
        setData(d[0].word)
        load_list_data(d[0].word)
        load_word_data(d[0].word)
        stem_load_word_data(d[0].word)
    }
    const callback = (key) => {
        if (key === "2" || key === "4") {
            console.log(data)
            setShow(true)
        }
    }
    const load_list_data = async (keyword) => {
        let d = (await Axios.get('/full_text_search/keyword_zipf_list/?word=' + keyword)).data
        setArticle(d)
    }
    const load_word_data = async (keyword) => {
        let d = (await Axios.get('/full_text_search/keyword_zipf_chart/?word=' + keyword)).data;
        setWord_arr(d)
        console.log(d)
    }

    const stem_load_word_data = async (keyword) => {
        let d = (await Axios.get('/full_text_search/stem_keyword_zipf_chart/?word=' + keyword)).data;
        setStem_arr(d)
        console.log(d)
    }




    return (

        <div style={{ margin: '1%' }}>
            <Search placeholder="input search text" onSearch={value => { load_data(value) }} enterButton />
            <br></br>
            <p style={{ fontSize: "12px" }}>以下為搜尋 {data} 的結果</p>
            <Tabs type="card" defaultActiveKey='1' onChange={callback}>
                <TabPane tab="article list" key="1" className='expand'>
                    <Table
                        columns={columns}
                        expandable={{
                            expandedRowRender: record => <div
                                className='table-detail'
                                dangerouslySetInnerHTML={{ __html: record.content }}
                            ></div>
                        }}
                        dataSource={article}
                        expandRowByClick={true}
                        rowKey={article => article.title}
                    />
                </TabPane>
                <TabPane tab="zipf chart" key="2" style={{ width: '100%', height: '100%' }} className='expand'>
                    <Compare_picture keyword={data} show={show} word={word_arr}></Compare_picture>
                </TabPane>
                <TabPane tab="stem zipf chart" key="4" style={{ width: '100%', height: '100%' }} className='expand'>
                    <Compare_picture keyword={data} show={show} word={stem_arr}></Compare_picture>
                </TabPane>
                <TabPane tab="word list" key="3" style={{ width: '100%', height: '100%' }} className='expand'>
                    <Table columns={word_columns} dataSource={word_arr} />

                </TabPane>
            </Tabs>
        </div>
    )
}
