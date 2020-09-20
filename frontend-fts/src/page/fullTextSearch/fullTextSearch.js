import { InboxOutlined } from '@ant-design/icons'
import { Divider, message } from 'antd'
import Search from 'antd/lib/input/Search'
import Dragger from 'antd/lib/upload/Dragger'
import Axios from 'axios'
import React, { useEffect, useReducer, useState } from 'react'
import { Route, useHistory, Switch } from 'react-router-dom'
import './fullTextSearch.css'

export const FulltextSearch = () => {


    return (
        <div className="main-layout expand">
            <Switch>
                <Route exact path="/fts" component={MyDragger} />
                <Route exact path="/fts/search" component={MySearch}></Route>
            </Switch>
        </div>
    )
}

const MyDragger = () => {
    let history = useHistory();
    const props = {
        name: 'file',
        action: '/full_text_search/upload_file',
        headers: {
            enctype: 'multipart/form-data',
        },
        onChange(info) {
            if (info.file.status !== 'uploading') {
                console.log(info.file, info.fileList);
            }
            if (info.file.status === 'done') {
                history.push('/fts/search')
                message.success(`${info.file.name} file uploaded successfully`);
            } else if (info.file.status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
    };
    return (
        <Dragger {...props}
            className="expand"
        >
            <div style={{ justifyContent: 'center' }}>
                <p className='antd-upload-drag-icon'>
                    <InboxOutlined />
                </p>
                <p style={{ color: "gray" }}>拖曳檔案或點擊此處上傳</p>
            </div>
        </Dragger>


    )

}

const MySearch = () => {
    const [data, setData] = useState([])
    const [array, setArray] = useState([])
    const [ignore, forceUpdate] = useReducer(x => x + 1, 0);
    useEffect(() => {
        load_data()
    }, [])
    useEffect(() => {
        change_view()
    }, [data])
    const change_view = () => {
        let arr = [];
        for (let d of data) {
            arr.push(<div>
                <Divider orientation="left">{d.name}</Divider>
                <p
                    dangerouslySetInnerHTML={{ __html: d.content }}
                >
                </p>
            </div>)
        }
        setArray(arr);
    }
    const load_data = async () => {
        let d = (await Axios.get('/full_text_search/get_contents')).data
        //console.log(d)
        setData(d)
    }
    const get_position = async (keyword) => {
        for (let t of data) {
            t.content.replace('<yellow-block>', '')
        }
        let tempData = [...data];
        console.log(keyword)
        let d = (await Axios.get('/full_text_search/get_position/?keyword=' + keyword)).data;
        //console.log(d)
        for (let record of d) {
            let index = record.position.split(',')
            let content = data.find(da => da.id === record.title).content.split(' ');
            //console.log(content)
            for (let i of index) {
                content[parseInt(i) - 1] = '<yellow-block>' + content[parseInt(i) - 1] + '</yellow-block>';
            }
            content = content.join(' ');
            //console.log(content)
            let ind = data.findIndex(da => da.id === record.title);
            tempData[ind].content = content;
        }
        setData(tempData)
    }
    return (
        <div>
            <Search placeholder="input search text" onSearch={value => { get_position(value) }} enterButton />
            <div>{array}</div>
        </div>
    )
}
