import React, { Component } from 'react'
import { Table } from "antd";
import styles from './index.less';
export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pluginInfo: {}
    }
  }
  componentDidMount() {

  }
  render() {
    const columns = [
      {
        title: '姓名',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '年龄',
        dataIndex: 'age',
        key: 'age',
      },
      {
        title: '住址',
        dataIndex: 'address',
        key: 'address',
      },
      {
        title: '操作',
        dataIndex: 'handle',
        key: 'handle',
      },
    ];
    const dataSource = [
      {
        key: '1',
        name: '胡彦斌',
        age: 32,
        address: '西湖区湖底公园1号',
      },
      {
        key: '2',
        name: '胡彦祖',
        age: 42,
        address: '西湖区湖底公园1号',
      },
    ];
    return (
      <div className={styles.Separate_example_content}>
        <h1>======平台管理插件========</h1>
        <p>平台管理插件,负责审核用户端发过来的请求</p>
        <Table dataSource={dataSource} columns={columns} />;
      </div>
    )
  }
}