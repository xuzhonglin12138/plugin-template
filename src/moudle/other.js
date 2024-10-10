import React, { Component } from 'react'
import { ConfigProvider } from 'antd'
import Other from '../page/other/index'
import intl from 'react-intl-universal';
import dayjs from 'dayjs';
import enUS from 'antd/locale/en_US';
import zhCN from 'antd/locale/zh_CN';
import 'dayjs/locale/zh-cn';
const locales = {
  "en": require('../locales/en-US.json'),
  "zh": require('../locales/zh-CN.json'),
};

export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      colorPrimary: this.props?.colorPrimary || '#1677ff',
      currentLocale: this.props?.currentLocale || 'zh',
      initDone: false,
      antdLocale: zhCN
    }
  }
  componentDidMount() {
    this.loadLocales()
  }
  loadLocales() {
    const { currentLocale } = this.state
    if (currentLocale == 'zh') {
      this.setState({
        antdLocale: zhCN
      })
      dayjs.locale('zh-cn');
    } else {
      this.setState({
        antdLocale: enUS
      })
      dayjs.locale('en');
    }
    intl.init({
      currentLocale: currentLocale,
      locales,
    })
      .then(() => {
        this.setState({ initDone: true });
      });
  }
  render() {
    const { colorPrimary, antdLocale } = this.state
    return (
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: colorPrimary
          }
        }}
        locale={antdLocale}
      >
        {this.state.initDone &&
          <Other {...this.props} />
        }
      </ConfigProvider>
    )
  }
}