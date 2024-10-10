import React, { Component } from 'react'
import { Form, Input, Switch, Button, notification, Card } from 'antd';
import WithModifiedProps from '../../components/withModifiedProps'
import UploadForm from '../../components/UploadForm'
import styles from './index.less';

class index extends Component {
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
    this.state = {
    }
  }
  componentDidMount() {

  }
  /**
 * onOk
 * - 表单提交处理方法。验证表单字段，处理上传文件的URL，并调用更新企业基本信息的方法。
 */
  onOk = async () => {
    try {
      const values = await this.formRef.current.validateFields();
      if (
        values.logo &&
        values.logo.fileList &&
        values.logo.fileList.length > 0
      ) {
        const fileUrl = this.handleFileUrl(values.logo.fileList[values.logo.fileList.length - 1]);
        if (fileUrl) {
          values.logo = fileUrl;
        }
      } else {
        values.logo = '';
      }
      if (
        values.favicon &&
        values.favicon.fileList &&
        values.favicon.fileList.length > 0
      ) {
        const fileUrl = this.handleFileUrl(values.favicon.fileList[values.favicon.fileList.length - 1]);
        if (fileUrl) {
          values.favicon = fileUrl;
        }
      } else {
        values.favicon = '';
      }
      this.handelIsOpenBasicInformation(values);
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  /**
   * handleFileUrl
   * - 提取文件信息中的文件 URL。
   */
  handleFileUrl = (fileInfo) => {
    return (
      fileInfo.response &&
      fileInfo.response.code === 200 &&
      fileInfo.response.data.bean &&
      fileInfo.response.data.bean.file_url
    );
  };

  /**
   * fetchEnterpriseInfo
   * - 获取企业信息方法。向后端请求当前企业的信息数据。
   */
  fetchEnterpriseInfo = () => {
    const { dispatch, componentData } = this.props
    dispatch && dispatch({
      type: 'global/fetchEnterpriseInfo',
      payload: {
        enterprise_id: componentData.eid
      }
    });
  };

  /**
   * handelIsOpenBasicInformation
   * - 更新企业基本信息方法。发送更新请求到后端，并处理回调更新页面及通知消息。
   */
  handelIsOpenBasicInformation = (value) => {
    const { dispatch, formatMessage, baseInfo, componentData } = this.props
    dispatch && dispatch({
      type: 'global/putBasicInformation',
      payload: {
        ...value,
        enterprise_id: componentData.eid
      },
      callback: () => {
        notification.success({ message: formatMessage({ id: 'enterpriseSetting.individuation.save.success' }) });
        this.fetchEnterpriseInfo();
        // 初始化 获取RainbondInfo信息
        this.props.dispatch({
          type: 'global/fetchRainbondInfo',
          callback: info => {
            if (info) {
              const fetchFavicon = info.disable_logo
                ? info.favicon.value
                : baseInfo?.rainbondUtil.fetchFavicon(info);
              const link =
                document.querySelector("link[rel*='icon']") ||
                document.createElement('link');
              link.type = 'image/x-icon';
              link.rel = 'shortcut icon';
              link.href = fetchFavicon;
              document.getElementsByTagName('head')[0].appendChild(link);
            }
          }
        });
      }
    });
  };

  render() {
    const {
      formatMessage,
      baseInfo,
      componentData
    } = this.props;
    console.log(componentData.data, "componentData");
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 17 }
      }
    };
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0,
        },
        sm: {
          span: 24,
          offset: 7,
        },
      },
    };
    const parameters = {
      formItemLayout,
      data: componentData?.data
    };
    return (
      <div className={styles.settingStyle}>
        <Card
          title={formatMessage({ id: 'enterpriseSetting.individuation.title1' })}
          bordered={false}

        >
          <Form
            ref={this.formRef}
            style={{ width: '500px' }}
            layout="vertical"
          >
            <Form.Item
              {...formItemLayout}
              label={formatMessage({ id: 'enterpriseSetting.basicsSetting.basicInformation.form.label.title' })}
              name="title"
              initialValue={componentData.data.title || ''}
              rules={[
                {
                  required: true,
                  message: formatMessage({ id: 'placeholder.oauth.title' })
                },
                {
                  max: 64,
                  message: formatMessage({ id: 'placeholder.appShare.max64' })
                }
              ]}
            >
              <Input placeholder={formatMessage({ id: 'placeholder.oauth.title' })} />
            </Form.Item>

            <Form.Item
              {...formItemLayout}
              label={formatMessage({ id: 'enterpriseSetting.basicsSetting.basicInformation.form.label.enterprise_alias' })}
              name="enterprise_alias"
              initialValue={componentData.data.enterprise_alias || ''}
              rules={[
                {
                  required: true,
                  message: formatMessage({ id: 'placeholder.oauth.enterprise_alias' })
                },
                {
                  max: 64,
                  message: formatMessage({ id: 'placeholder.appShare.max64' })
                }
              ]}
            >
              <Input placeholder={formatMessage({ id: 'placeholder.oauth.enterprise_alias' })} />
            </Form.Item>

            <Form.Item
              {...formItemLayout}
              label={formatMessage({ id: 'enterpriseSetting.basicsSetting.basicInformation.form.label.doc_url' })}
              name="doc_url"
              initialValue={componentData?.data.doc_url || ''}
              rules={[
                {
                  max: 255,
                  message: formatMessage({ id: 'placeholder.max255' })
                }
              ]}
            >
              <Input placeholder={formatMessage({ id: 'placeholder.oauth.doc_url' })} />
            </Form.Item>

            <Form.Item
              {...formItemLayout}
              label={formatMessage({ id: 'teamAdd.create.code.demo' })}
              name="enable_official_demo"
              valuePropName="checked"
            >
              <Switch defaultChecked={componentData?.data.officialDemo || false} />
            </Form.Item>

            {/* 设置 Footer 内容 */}
            <Form.Item {...formItemLayout} label="Footer" name="footer" initialValue={componentData?.data.footer || ''} rules={[
              {
                max: 255,
                message: formatMessage({ id: 'placeholder.max255' })
              }
            ]}>
              <Input placeholder={formatMessage({ id: 'enterpriseSetting.individuation.footer.placeholder' })} />
            </Form.Item>

            {/* LOGO */}
            <UploadForm
              {...parameters}
              baseInfo={baseInfo}
              name="logo"
              label={formatMessage({ id: 'enterpriseSetting.basicsSetting.basicInformation.form.label.logo' })}
              extra={formatMessage({ id: 'placeholder.oauth.logo' })}
              initialValue={componentData?.data.logo || ''}
              required={false}
              imgstyle={{ width: '80px', height: '40px' }}
            />

            {/* 网页图标 */}
            <UploadForm
              {...parameters}
              baseInfo={baseInfo}
              name="favicon"
              label={formatMessage({ id: 'enterpriseSetting.basicsSetting.basicInformation.form.label.favicon' })}
              extra={formatMessage({ id: 'placeholder.oauth.favicon' })}
              initialValue={componentData?.data.favicon || ''}
              required={false}
              imgstyle={{ width: '33px', maxHeight: '33px' }}
            />

            <Form.Item {...tailFormItemLayout}>
              <Button type="primary" onClick={this.onOk}>
                {formatMessage({ id: 'enterpriseSetting.individuation.btn.submit' })}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    )
  }
}
export default WithModifiedProps(index)