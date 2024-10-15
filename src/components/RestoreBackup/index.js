import React, { Component } from 'react'
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Modal, Button, Spin, notification,} from 'antd';
import intl from 'react-intl-universal';

export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      restore_id: '',
      showRestore: false,
      restore_status: '',
      new_group_id: '',
      isFinished: '',
      notRecovered_restore_id: '',
      restore: false,
      restoreUrl: ''
    };
    this.mount = false;
  }
  componentDidMount() {
    this.mount = true;
    const { dispatch, baseInfo } = this.props;
    dispatch({
      type: 'application/queryRestoreState',
      payload: {
        team_name: baseInfo?.team_name || baseInfo?.globalUtile.getCurrTeamName(),
        group_id: this.props.groupId,
        group_uuid: this.props.group_uuid
      },
      callback: data => {
        if (data) {
          this.setState({
            isFinished: data.bean.is_finished,
            event_id: data.bean.data === null ? '' : data.bean.data.event_id,
            notRecovered_restore_id:
              data.bean.data === null ? '' : data.bean.data.restore_id
          });
        }
      }
    });
  }
  componentWillUnmount() {
    this.mount = false;
  }
  handleRestore = () => {
    const { propsParams, backupId, groupId, dispatch } = this.props;
    dispatch({
      type: 'application/migrateApp',
      payload: {
        team_name: propsParams && propsParams.teamName,
        region: propsParams && propsParams.regionName,
        team: propsParams && propsParams.teamName,
        backup_id: backupId,
        group_id: groupId,
        migrate_type: 'recover',
        event_id: this.state.event_id,
        notRecovered_restore_id: this.state.notRecovered_restore_id
      },
      callback: data => {
        // notification.success({message: "开始恢复中",duration:'2'});
        if (data) {
          this.setState({ restore_id: data.bean.restore_id }, () => {
            this.queryMigrateApp();
          });
        }
      }
    });
  };

  handleSubmit = () => {
    const { restore } = this.state;
    const { dispatch, onCancel, baseInfo } = this.props;
    dispatch({
      type: 'application/delRestore',
      payload: {
        team_name: baseInfo?.team_name || baseInfo?.globalUtile.getCurrTeamName(),
        group_id: this.props.groupId,
        new_group_id: this.state.new_group_id
      },
      callback: data => {
        if (data) {
          notification.success({ message: intl.get('notification.success.delete'), duration: '2' });
          if (restore) {
            this.JumpAddress();
          }
          if (onCancel) {
            onCancel();
          }
        }
      }
    });
  };

  // 查询恢复情况
  queryMigrateApp = () => {
    if (!this.mount) return;
    const { restore_id: restoreId } = this.state;
    const { propsParams, dispatch, groupId } = this.props;
    const teamName = propsParams && propsParams.teamName;
    const regionName = propsParams && propsParams.regionName;
    dispatch({
      type: 'application/queryMigrateApp',
      payload: {
        team_name: teamName,
        restore_id: restoreId,
        group_id: groupId
      },
      callback: data => {
        if (data && data.bean) {
          const info = data.bean;
          this.setState({
            showRestore: true,
            restore_status: info.status,
            new_group_id: info.group_id
          });
          if (info.status == 'starting') {
            setTimeout(() => {
              this.queryMigrateApp();
            }, 2000);
          } else if (info.status == 'success') {
            this.setState({
              restore: true,
              restoreUrl: `/team/${teamName}/region/${regionName}/apps/${info.group_id}`
            });
          }
        }
      }
    });
  };

  JumpAddress = () => {
    const { jumpRouter } = this.props;
    const { restoreUrl } = this.state;
    jumpRouter&& jumpRouter(restoreUrl)
  };

  render() {
    const {
      restore_status: restoreStatus,
      isFinished,
      showRestore
    } = this.state;
    const { onCancel } = this.props;
    const cenStyle = {
      textAlign: 'center',
      fontSize: '14px'
    };
    if (isFinished === '') {
      return null;
    }
    return (
      <Modal
      centered
      open
      onCancel={onCancel}
      title={intl.get('button.recover')}
      closable={restoreStatus == 'starting'? false : true}
      footer={
        !showRestore
          ? [
              <Button key="back" onClick={onCancel}>
                {intl.get('button.close')}
              </Button>,
              <Button
                key="submit"
                type="primary"
                onClick={this.handleRestore}
              >
                {intl.get('button.recover')}
              </Button>
            ]
          : restoreStatus == 'success'
          ? [
              <Button key="back" onClick={this.JumpAddress}>
                {intl.get('button.close')}
              </Button>,
              <Button key="submit" type="primary" onClick={this.handleSubmit}>
                {intl.get('popover.confirm')}
              </Button>
            ]
          : restoreStatus == 'starting' ? false : [
              <Button key="back" onClick={onCancel}>
                {intl.get('button.close')}
              </Button>
            ]
      }
    >
      {showRestore ? (
        <div>
          {restoreStatus == 'starting' && (
            <div>
              <p style={{ textAlign: 'center' }}>
                <Spin />
              </p>
              <p style={cenStyle}>{intl.get('notification.hint.recover.loading')}</p>
            </div>
          )}
          {restoreStatus == 'success' && (
            <div>
              <p
                style={{
                  textAlign: 'center',
                  color: '#28cb75',
                  fontSize: '36px'
                }}
              >
                <CheckCircleOutlined />
              </p>
              <p style={cenStyle}>{intl.get('notification.hint.recover.success.delete')}</p>
            </div>
          )}
          {restoreStatus == 'failed' && (
            <div>
              <p
                style={{
                  textAlign: 'center',
                  color: '999',
                  fontSize: '36px'
                }}
              >
                <CloseCircleOutlined />
              </p>
              <p style={cenStyle}>{intl.get('notification.hint.recover.error.alert')}</p>
            </div>
          )}
        </div>
      ) : isFinished ? (
        <div>
          <p>{intl.get('notification.hint.recover.alert')}</p>
        </div>
      ) : (
        <div>
          <p>{intl.get('notification.hint.recover.warning.continue')}</p>
        </div>
      )}
    </Modal>
    )
  }
}
