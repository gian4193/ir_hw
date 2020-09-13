import React, { useState, useEffect, useReducer } from 'react';
import './home.css';
import { Table } from 'antd';
import HomeService from './home.service';
import 'antd/dist/antd.css';
import Search from 'antd/lib/input/Search';

export const Home = () => {
    const service = HomeService();
    const [data, setData] = useState([]); //[] 初始為空array
    const [ignore, forceUpdate] = useReducer(x => x + 1, 0); //畫面更新 useState 的變數沒改變時畫面不會更新
    const column = [
        { title: 'Word', dataIndex: 'word', key: 'word' },
        { title: 'Position', dataIndex: 'position', key: 'position' },
        { title: 'Title', dataIndex: 'title', key: 'title' }
    ]
    const expandable = {
        expandedRowRender: record => <div
            className='table-detail'
            dangerouslySetInnerHTML={{ __html: record.article }}
        ></div>,
        expandRowByClick: true
    }
    const expandRow = async (record) => {
        let article = await service.getArticleById(record.article_id);
        let index = record.position.split(',');
        let contents = article.content.split(' ');
        for (let i of index) {
            contents[parseInt(i) - 1] = '<yellow-block>' + record.word + '</yellow-block>';
        }
        contents = contents.join(' ');
        record.article = contents;
        forceUpdate();
    }
    // setData(
    //     {
    //         ...data,
    //         n : 
    //     }
    // )

    useEffect(() => {
        console.log(data);
    }, [data])

    const searchFullText = async (text) => {
        setData(await service.search(text));
    }  //parameter async( par )

    return (
        <div className="main-layout">
            <Search
                enterButton
                onSearch={value => searchFullText(value)}
                placeholder="type keyword"
                style={{ margin: "20px 0px" }}
            />
            <div className="table-style">
                <Table
                    columns={column}
                    rowKey={data => data.key}
                    dataSource={data}
                    onExpand={(expand, record) => {
                        if (expand)
                            expandRow(record);
                    }}
                    expandable={expandable}
                />
            </div>
        </div>
    )
}
