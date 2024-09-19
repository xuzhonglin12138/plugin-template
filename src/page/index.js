import React, { Component } from 'react'
import { ConfigProvider, Tabs } from 'antd'
import Content from './content/index'
import Other from './other/index'

export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      colorPrimary: this.props.colorPrimary || '#1677ff'
    }
  }
  onChange = (key) => {
    console.log(key);
  };
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
        <Tabs
          onChange={this.onChange}
          type="card"
          items={[
            {
              label: "主页面",
              key: 'Content',
              children: <Content {...this.props} />,
            },
            {
              label: "辅页面",
              key: 'Other',
              children: <Other {...this.props} />,
            }
          ]}
        />
      </ConfigProvider>
    )
  }
}