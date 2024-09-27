import React, { Component } from 'react'
import { Table } from "antd";
import WithModifiedProps from '../../components/withModifiedProps'
import styles from './index.less';

 class index extends Component {
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
        name: '刘亦菲',
        age: 32,
        address: '北京市东城区东湖别墅111111',
      },
      {
        key: '2',
        name: '宋祖儿',
        age: 42,
        address: '北京市东城区东湖别墅111111',
      },
    ];
    return (
      <div className={styles.Separate_example_other}>
        <h1>======构建版本上传========</h1>
        <p>团队管理插件,负责向平台端发起审核请求</p>
        <Table dataSource={dataSource} columns={columns} />;
      </div>
    )
  }
}
export default WithModifiedProps(index)