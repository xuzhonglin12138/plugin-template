import React, { Component } from 'react'
import { ConfigProvider } from 'antd'
import Content from './content/index'

export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      colorPrimary: this.props.colorPrimary || '#1677ff'
    }
  }

  render() {
    const { colorPrimary } = this.state
    return (
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: colorPrimary
          }
        }}
      >
        <Content {...this.props} />
      </ConfigProvider>
    )
  }
}
