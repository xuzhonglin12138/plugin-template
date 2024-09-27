import React, { Component } from 'react'
import { Button, Modal, notification, Upload } from "antd";
import intl from 'react-intl-universal';

export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fileList: []
    };
  }
  onChange = info => {
    const { fileList } = info;
    const { status } = info.file;
    if (status === "done") {
      this.props.onReLoad && this.props.onReLoad();
    } else if (status === "error") {
      const { response } = info.file;
      notification.warning({ message: response.msg_show });
    }

    // 重新设置state
    if (fileList[0] && fileList[0].status == "error") {
      this.setState({ fileList: [] });
    } else {
      this.setState({ fileList });
    }
  };
  onRemove = () => {
    notification.info({
      message: intl.get('status.app.backups.imported'),
      duration: "2"
    });
    return false;
  };
  onData = file => {
    console.log(`--->${JSON.stringify(file)}`);
  };
  render() {
    const { baseInfo } =this.props
    const { fileList } = this.state;
    const token = baseInfo.token
    const group_id = this.props.groupId;
    const team_name = baseInfo.globalUtile.getCurrTeamName();
    const myheaders = {};
    if (token) {
      myheaders.Authorization = `GRJWT ${token}`;
      myheaders.X_REGION_NAME = baseInfo.globalUtile.getCurrRegionName();
      myheaders.X_TEAM_NAME = baseInfo.globalUtile.getCurrTeamName();
    }
    const uploadUrl = `${
      baseInfo.baseUrl
    }/console/teams/${team_name}/groupapp/${group_id}/backup/import`;

    return (
      <Modal
        centered
        open
        onCancel={this.props.onCancel}
        title={intl.get('appBackups.table.pages.importBackup.title')}
        footer={[
          <Button key="back" onClick={this.props.onCancel}>
            {intl.get('button.close')}
          </Button>
        ]}
      >
        <Upload
          action={uploadUrl}
          accept=".bak"
          fileList={fileList}
          onChange={this.onChange}
          headers={myheaders}
          onRemove={this.onRemove}
          data={this.onData}
        >
          {fileList.length > 0 ? null : <Button>{intl.get('appBackups.importBackup.select.file')}</Button>}
        </Upload>
      </Modal>
    )
  }
}
