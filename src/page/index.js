import React, { Component } from 'react'
import { ConfigProvider, Tabs } from 'antd'
import Content from './content/index'
import Other from './other/index'
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
  onChange = (key) => {
    console.log(key);
  };
  render() {
    const { colorPrimary, currentLocale } = this.state
    return (
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: colorPrimary
          }
        }}
        locale={currentLocale == 'zh' ? 'cn': 'en'}
      >
        {this.state.initDone &&
          <Tabs
            onChange={this.onChange}
            type="card"
            items={[
              {
                label: intl.get('root'),
                key: 'Content',
                children: <Content {...this.props} />,
              },
              {
                label: intl.get('other'),
                key: 'Other',
                children: <Other {...this.props} />,
              }
            ]}
          />

        }

      </ConfigProvider>
    )
  }
}