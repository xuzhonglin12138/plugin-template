import { Form, Spin, Upload, notification } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import React, { PureComponent } from 'react';
import styles from './index.less';

class UploadForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      imageUrl: ''
    };
  }

  componentDidMount() {
    const { initialValue } = this.props;
    this.setState({
      imageUrl: initialValue || ''
    });
  }

  handleLogoChange = info => {
    if (info.file.status === 'uploading') {
      this.setState({ loading: true });
      return;
    }
    if (info.file.status === 'done') {
      if (
        info.file &&
        info.file.response &&
        info.file.response.data &&
        info.file.response.data.bean &&
        info.file.response.data.bean.file_url
      ) {
        this.setState({
          imageUrl: info.file.response.data.bean.file_url,
          loading: false
        });
      }
    } else if (info.file.status === 'error') {
      notification.warning({ message: info.file.response.msg_show });
      this.setState({
        loading: false
      });
    }
  };

  handleLogoRemove = () => {
    this.setState({ imageUrl: '' });
  };

  render() {
    const {
      label,
      extra,
      imgstyle,
      uploadBtnStyle,
      formItemLayout,
      baseInfo,
      name
    } = this.props;
    const { loading, imageUrl } = this.state;
    const myheaders = {};
    const GRtoken = baseInfo?.token;
    if (GRtoken) {
      myheaders.Authorization = `GRJWT ${GRtoken}`;
    }

    const uploadButton = (
      <div style={uploadBtnStyle}>
        <PlusOutlined />
        <div className="ant-upload-text">上传</div>
      </div>
    );

    return (
      <Form.Item {...formItemLayout} label={label} extra={extra} name={name}>
        <Upload
          name="file"
          accept="image/jpg,image/jpeg,image/png"
          className={styles.customUpload}
          action={baseInfo.imageUploadUrl}
          listType="picture-card"
          headers={myheaders}
          showUploadList={false}
          onChange={this.handleLogoChange}
          onRemove={this.handleLogoRemove}
        >
          {imageUrl ? (
            <Spin spinning={loading}>
              <img src={imageUrl} alt="avatar" style={imgstyle} />
            </Spin>
          ) : (
            uploadButton
          )}
        </Upload>
      </Form.Item>
    );
  }
}

export default UploadForm;
