import React, { Component } from 'react'
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Modal, Button, Spin, Alert, notification, Select, Row, Col } from 'antd';
import intl from 'react-intl-universal';


export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      teamsData: [],
      regionData: [],
      teamsName: '',
      regionName: '',
      restore_id: '',
      showRestore: false,
      restore_status: '',
      notRecovered_restore_id: ''
    };
    this.mount = false;
  }
  componentDidMount() {
    this.mount = true;
    this.setTeamList();
    this.queryIsFinished();
  }
  componentWillUnmount() {
    this.mount = false;
  }

  onRegionChange = value => {
    const { mode, currentRegion } = this.props;
    if (mode !== 'full-online' && value !== currentRegion) {
      notification.warning({
        message: intl.get('appBackups.table.pages.model.migration')
      });
      return;
    }
    this.setState({ regionName: value });
  };

  setTeamList = () => {
    const { teams } = this.props.currUser;
    const teamsArr = [];
    teams.map(order => {
      const orderbox = {};
      orderbox.team_alias = order.team_alias;
      orderbox.team_name = order.team_name;
      orderbox.region = order.region;
      teamsArr.push(orderbox);
      return order;
    });
    this.setState({ teamsData: teamsArr });
  };
  handleSubmit = () => {
    const { mode, currentRegion, baseInfo, dispatch } = this.props;
    const { regionName, teamsName } = this.state;
    if (teamsName === '') {
      notification.warning({ message: intl.get('notification.hint.migration.team') });
      return;
    }
    if (regionName === '') {
      notification.warning({ message: intl.get('notification.hint.migration.cluster') });
      return;
    }
    if (mode !== 'full-online' && regionName !== currentRegion) {
      notification.warning({
        message: intl.get('appBackups.table.pages.model.migration')
      });
      return;
    }

    dispatch && dispatch({
      type: 'application/migrateApp',
      payload: {
        team_name: baseInfo?.team_name || baseInfo?.globalUtile.getCurrTeamName(),
        region: this.state.regionName,
        team: this.state.teamsName,
        backup_id: this.props.backupId,
        group_id: this.props.groupId,
        migrate_type: 'migrate',
        event_id: this.state.event_id,
        notRecovered_restore_id: this.state.notRecovered_restore_id
      },
      callback: data => {
        // notification.success({message: "开始迁移应用",duration:'2'});
        if (data) {
          this.setState({ restore_id: data.bean.restore_id }, () => {
            this.queryMigrateApp();
          });
        }
      }
    });
  };
  // 查询迁移状态
  queryMigrateApp = () => {
    const { baseInfo, dispatch, jumpRouter } = this.props;

    if (!this.mount) return;
    dispatch && dispatch({
      type: 'application/queryMigrateApp',
      payload: {
        team_name: baseInfo?.team_name || baseInfo?.globalUtile.getCurrTeamName(),
        restore_id: this.state.restore_id,
        group_id: this.props.groupId
      },
      callback: data => {
        if (data) {
          this.setState({
            showRestore: true,
            restore_status: data.bean.status
          });
          if (data.bean.status === 'success') {
            jumpRouter&& jumpRouter(`/team/${data.bean.migrate_team}/region/${data.bean.migrate_region}/apps/${data.bean.group_id}/appoverview`)
            window.location.reload();
          }
          if (data.bean.status === 'failed') {
            // this.props.onCancel && this.props.onCancel()
          }
          if (data.bean.status === 'starting') {
            setTimeout(() => {
              this.queryMigrateApp();
            }, 2000);
          }
        }
      }
    });
  };

  handleTeamsChange = value => {
    const { teamsData } = this.state;
    const { moveBackupMode, currentRegion } = this.props;
    let regionList = [];
    teamsData.map(order => {
      if (order.team_name === value) {
        if (moveBackupMode !== 'full-offline') {
          regionList = order.region;
        } else {
          regionList = order.region.filter(
            re => re.team_region_name === currentRegion
          );
        }
      }
      return order;
    });
    this.setState({
      teamsName: value,
      regionData: regionList,
      regionName: regionList.length > 0 ? regionList[0].team_region_name : ''
    });
  };

  queryIsFinished = () => {
    const { dispatch, baseInfo } = this.props;
    dispatch && dispatch({
      type: 'application/queryRestoreState',
      payload: {
        team_name: baseInfo?.team_name,
        group_id: this.props.groupId,
        group_uuid: this.props.group_uuid
      },
      callback: data => {
        if (data) {
          this.setState({
            event_id: data.bean.data === null ? '' : data.bean.data.event_id,
            notRecovered_restore_id:
              data.bean.data === null ? '' : data.bean.data.restore_id
          });
        }
      }
    });
  };
  render() {
    const teamsData = this.state.teamsData || [];
    const regionData = this.state.regionData || [];
    const restoreStatus = this.state.restore_status;
    const { moveBackupMode } = this.props;
    const { showRestore } = this.state;
    const teamsDataOption = teamsData.map(order => {
      return { value: order.team_name, label: order.team_alias }
    })
    const regionDataOption = regionData.map(order => {
      return { value: order.team_region_name, label: order.team_region_alias }
    })
    return (
      <Modal
        centered
        open
        onCancel={this.props.onCancel}
        onOk={this.handleSubmit}
        title={intl.get('appBackups.table.pages.migration.title')}
        closable={!showRestore}
        footer={
          showRestore
            ? false
            : [
              <Button key="back" onClick={this.props.onCancel}>
                {intl.get('button.close')}
              </Button>,
              <Button key="submit" type="primary" onClick={this.handleSubmit}>
                {intl.get('button.migration')}
              </Button>
            ]
        }
      >
        {showRestore ? (
          <div>
            {restoreStatus === 'starting' ? (
              <div>
                <p style={{ textAlign: 'center' }}>
                  <Spin />
                </p>
                <p style={{ textAlign: 'center', fontSize: '14px' }}>
                  {intl.get('notification.hint.migration.loading.desc')}
                </p>
              </div>
            ) : (
              ''
            )}
            {restoreStatus === 'success' ? (
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
                <p style={{ textAlign: 'center', fontSize: '14px' }}>
                  {intl.get('notification.success.migration')}
                </p>
              </div>
            ) : (
              ''
            )}
            {restoreStatus === 'failed' ? (
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
                <p style={{ textAlign: 'center', fontSize: '14px' }}>
                  {intl.get('notification.error.migration')}
                </p>
              </div>
            ) : (
              ''
            )}
          </div>
        ) : (
          <div>
            {moveBackupMode === 'full-offline' && (
              <Alert type="warning" message={intl.get('notification.hint.migration.warning.alert')} />
            )}
            <p style={{margin: '24px 0'}}>{intl.get('appBackups.table.pages.migration.teamOrCluster')}</p>
            <Row>
              <Col span={12}>
                <Select
                  style={{ width: '90%', marginRight: '10px' }}
                  onSelect={this.handleTeamsChange}
                  defaultValue={intl.get('placeholder.backup.select.team')}
                  options={teamsDataOption}
                />
              </Col>
              <Col span={12}>
                <Select
                  style={{ width: '90%' }}
                  onSelect={this.onRegionChange}
                  value={this.state.regionName}
                  options={regionDataOption}
                />
              </Col>
            </Row>
          </div>
        )
        }
      </Modal>
    )
  }
}
