import React, { Component } from 'react'
import { Button, Input } from 'antd';
import avatar from '../../assets/images/avatar.png';
import home from '../../assets/images/home.svg';
import './index.css';
class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }
  render() {
    console.log(this.props);
    return (
      <div className='hello'>
        <div>hello,这里是最基础的demo</div>
        <div>
          <p>测试antd 是否可用</p>
          <Button type="primary">Primary</Button>
          <Input placeholder="Basic usage" />
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

export default index