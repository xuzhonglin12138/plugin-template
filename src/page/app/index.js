import React, { Component } from 'react'
import { Button } from 'antd';
import styles from './index.less'
import avatar from '../../assets/images/avatar.png';
import home from '../../assets/images/home.svg';
export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }
  render() {
    return (
      <div className={styles.hello}>
        <div>hello,这里是最基础的demo</div>
        <div>
          <p>测试antd 是否可用</p>
          <Button type="dashed">Dashed</Button>
        </div>
        <div>
          <p>测试图片 是否可用</p>
          <img src={avatar} alt="" />
        </div>
        <div>
          <p>测试svg 是否可用</p>
          <img src={home} alt="" />
        </div>
      </div>
    )
  }
}
