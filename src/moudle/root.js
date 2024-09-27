import React, { Component } from 'react'
import { ConfigProvider } from 'antd'
import Content from '../page/content/index'
import intl from 'react-intl-universal';
const locales = {
  "en": require('../locales/en-US.json'),
  "zh": require('../locales/zh-CN.json'),
};

export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      colorPrimary: this.props?.baseInfo?.colorPrimary || '#1677ff',
      currentLocale: this.props?.baseInfo?.currentLocale || 'zh',
      initDone: false
    }
  }
  componentDidMount() {
    this.loadLocales()
  }
  loadLocales() {
    const { currentLocale } = this.state
    intl.init({
      currentLocale: currentLocale,
      locales,
    })
      .then(() => {
        this.setState({ initDone: true });
      });
  }
  render() {
    const { colorPrimary, currentLocale } = this.state
    return (
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: colorPrimary
          }
        }}
        locale={currentLocale == 'zh' ? 'cn' : 'en'}
      >
        {this.state.initDone &&
          <Content {...this.props} />
        }
      </ConfigProvider>
    )
  }
}