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
    const [sents, setSents] = useState(0)
    const [words, setＷords] = useState(0)
    const [chars, setChars] = useState(0)
    const [total, setTotal] = useState(0)
    const [search_word, setSearch_word] = useState('?')
    useEffect(() => {
        load_data()
    }, [])
    const change_view = (d) => {
        let arr = [];
        for (let data of d) {
            arr.push(<div>
                <Divider orientation="left" style={{ fontSize: "18px" }}>{data.name}</Divider>
                <p
                    dangerouslySetInnerHTML={{ __html: data.content }}
                >
                </p>
                <br></br>
            </div>
            )
        }
        setArray(arr);
    }
    const load_data = async () => {
        let d = (await Axios.get('/full_text_search/get_contents')).data
        //console.log(d)
        setData(d)
        let sent = 0
        let word = 0
        let char = 0
        for (let item of d) {
            sent = sent + item.sentence_count
            word = word + item.word_count
            char = char + item.character_conut
        }
        setSents(sent)
        setＷords(word)
        setChars(char)
        change_view(d)
    }
    const get_position = async (keyword) => {
        console.log(encodeURIComponent(keyword))
        let tempData = JSON.parse(JSON.stringify(data))  //deep copy
        let keyword_count = 0
        let d = (await Axios.get('/full_text_search/get_position/?keyword=' + encodeURIComponent(keyword))).data;
        console.log(d)
        for (let record of d) {
            let index = record.position.split(',')
            let content = data.find(da => da.id === record.title).content.split(/[ \n]+[\n]*/ig);
            //let content = data.find(da => da.id === record.title).content.split(/[ ]/ig);
            //console.log(content)
            //console.log(content)
            for (let i of index) {
                keyword_count = keyword_count + 1
                content[parseInt(i) - 1] = '<yellow-block>' + content[parseInt(i) - 1] + '</yellow-block>';
            }
            // for (let i = 0; i <= content.length - 1; i++) {
            //     if (content[parseInt(i)].includes(":"))
            //         content[parseInt(i)] = '\n' + '<h3>' + content[parseInt(i)] + '</h3>';
            // }
            content = content.join(' ');
            //console.log(content)
            let ind = data.findIndex(da => da.id === record.title);
            tempData[ind].content = content;
        }
        setSearch_word(keyword)
        setTotal(keyword_count)
        change_view(tempData)

    }
    return (
        <div>
            <Search placeholder="input search text" onSearch={value => { get_position(value) }} enterButton />
            <br /><br />
            <div>
                <p>
                    總句數：{sents} , 總詞數：{words} , 總字數：{chars}, 總共搜尋到{total}個{search_word}
                </p>
            </div>
            <div>{array}</div>
        </div>
    )
}
