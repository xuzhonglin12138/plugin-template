import React, { Component, Fragment, PureComponent } from 'react'
import { Table, notification, Button, Card, } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import sourceUtil from '../../utils/source-unit';
import WithModifiedProps from '../../components/withModifiedProps'
import MigrationBackup from '../../components/MigrationBackup'
import RestoreBackup from '../../components/RestoreBackup'
import ImportBackup from '../../components/ImportBackup'
import ConfirmModal from '../../components/ConfirmModal'
import logSocket from '../../utils/logSocket';
import Backup from '../../components/BackUp'
import styles from './index.less';


class BackupStatus extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      map: {
        starting: intl.get('status.app.backups.backuping'),
        success: intl.get('status.app.backups.success'),
        failed: intl.get('status.app.backups.error')
      }
    };
    this.timer = null;
  }
  componentDidMount() {
    const { data } = this.props;
    if (data.status === 'starting') {
      this.createSocket();
      this.startLoopStatus();
    }
  }
  componentWillUnmount() {
    this.stopLoopStatus();
    if (this.logSocket) {
      this.logSocket.destroy();
    }
    this.logSocket = null;
  }

  /**
   * 获取当前用户所在区域的 WebSocket URL
   * @returns {string} WebSocket 连接的 URL
   */
  getSocketUrl = () => {
    const { baseInfo } = this.props
    return baseInfo?.userUtil?.getCurrRegionSoketUrl(this.props.currUser);
  };
  /**
   * 创建一个 WebSocket 连接，并初始化 logSocket 对象
   */
  createSocket() {
    this.logSocket = new logSocket({
      url: this.getSocketUrl(),
      eventId: this.props.data.event_id,
      onMessage: msg => {
        console.log(msg);
      }
    });
  }
  /**
   * 开始轮询备份状态，通过调度 `application/fetchBackupStatus` action 获取备份状态
   * 如果状态仍然是 'starting'，则继续轮询，否则调用 `onEnd` 回调函数
   */
  startLoopStatus() {
    const { baseInfo, dispatch } = this.props
    dispatch && dispatch({
      type: 'application/fetchBackupStatus',
      payload: {
        team_name: baseInfo?.team_name,
        backup_id: this.props.data.backup_id,
        group_id: this.props.group_id
      },
      callback: data => {
        if (data) {
          const { bean } = data;
          if (bean.status === 'starting') {
            this.timer = setTimeout(() => {
              this.startLoopStatus();
            }, 10000);
          } else if (this.props.onEnd) {
            this.props.onEnd();
          }
        }
      }
    });
  }
  /**
   * 停止轮询备份状态，清除定时器
   */
  stopLoopStatus() {
    clearTimeout(this.timer);
  }
  render() {
    const data = this.props.data || {};
    return (
      <span>
        {this.state.map[data.status]}
        {data.status === 'starting' && (
          <LoadingOutlined style={{ marginLeft: 8 }} />
        )}
      </span>
    );
  }
}

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      page: 1,
      total: 0,
      pageSize: 6,
      showBackup: false,
      showMove: false,
      showDel: false,
      showRecovery: false,
      showImport: false,
      backup_id: '',
      appDetail: {},
      is_configed: null,
      group_uuid: '',
      warningText: '',
      componentList: [],
      operationPermissions: this.handlePermissions('app_backup'),
      loading: false,
      deleteLoading: false,
      language: this.props?.baseInfo?.currentLocale === "zh"
    }
  }
  componentDidMount() {
    const { groupDetail } = this.props;
    if (groupDetail && Object.keys(groupDetail).length > 0) {
      this.setState({
        appDetail: groupDetail,
        loadingDetail: false
      })
    } else {
      this.fetchAppDetail();
    }
    this.fetchBackup();
  }
  /**
 * 获取备份列表，通过调度 `application/fetchBackup` action 获取备份数据并更新状态
 */
  fetchBackup = () => {
    const { dispatch, baseInfo } = this.props
    dispatch && dispatch({
      type: 'application/fetchBackup',
      payload: {
        team_name: baseInfo?.team_name,
        group_id: baseInfo?.app_id,
        page: this.state.page,
        page_size: this.state.pageSize
      },
      callback: data => {
        if (data) {
          this.setState({
            list: data.list || [],
            total: data.total,
            is_configed: data.bean.is_configed
          });
        }
      }
    });
  };
  /**
  * 显示备份弹窗
  */
  onBackup = () => {
    this.setState({ showBackup: true });
  };
  /**
  * 获取当前应用组的 ID
  * @returns {string} 应用组的 ID
  */
  getGroupId = () => {
    const { baseInfo } = this.props;
    return baseInfo.app_id;
  };
  /**
 * 处理权限信息，根据权限类型返回相应的权限信息
 * @param {string} type - 权限类型
 * @returns {object} 权限信息对象
 */
  handlePermissions = type => {
    const { baseInfo, teamControl } = this.props;
    return baseInfo.roleUtil.queryPermissionsInfo(
      teamControl?.currentTeamPermissionsInfo?.team,
      type,
      `app_${this.getGroupId()}`
    );
  };
  /**
 * 取消备份操作，关闭备份弹窗并重置相关状态
 */
  cancelBackup = () => {
    this.setState({
      showBackup: false,
      warningText: '',
      componentList: [],
      loading: false
    });
  };
  /**
 * 取消加载状态
 */
  cancelLoading = () => {
    this.setState({
      loading: false
    });
  };
  /**
 * 执行备份操作，通过调度 `application/backup` action 创建备份，并处理错误情况
 * @param {object} data - 备份参数
 */
  handleBackup = data => {
    const { baseInfo, dispatch } = this.props;
    if (data && data.force) {
      this.setState({
        loading: true
      });
    }
    dispatch && dispatch({
      type: 'application/backup',
      payload: {
        team_name: baseInfo?.team_name,
        group_id: this.getGroupId(),
        ...data
      },
      callback: () => {
        this.cancelBackup();
        this.fetchBackup();
      },
      handleError: res => {
        if (res && res.data && res.data.code) {
          const { code } = res.data;
          if (code === 4122 || code === 4121) {
            this.setState({
              warningText:
                code === 4122
                  ? intl.get('appBackups.table.pages.abnormal.custom')
                  : intl.get('appBackups.table.pages.abnormal.not_stop'),
              componentList: res.data.data.list || []
            });
          } else if (res.data.msg_show) {
            notification.warning({ message: res.data.msg_show });
          }
        }
        this.cancelLoading();
      }
    });
  };
  /**
 * 获取应用详情，通过调度 `application/fetchGroupDetail` action 获取应用详情并更新状态
 */
  fetchAppDetail = () => {
    const { dispatch, baseInfo, jumpRouter } = this.props;
    this.setState({ loadingDetail: true });
    dispatch({
      type: 'application/fetchGroupDetail',
      payload: {
        team_name: baseInfo?.team_name,
        region_name: baseInfo?.region_name,
        group_id: baseInfo?.app_id
      },
      callback: res => {
        if (res && res.status_code === 200) {
          this.setState({
            appDetail: res.bean,
            loadingDetail: false
          });
        }
      },
      handleError: res => {
        if (res && res.code === 404) {
          jumpRouter && jumpRouter(`/team/${baseInfo?.team_name}/region/${baseInfo?.region_name}/apps`)
        }
      }
    });
  };
  /**
 * 显示导入备份弹窗
 */
  toAdd = () => {
    this.setState({ showImport: true });
  };
  /**
   * 处理导入备份操作，显示成功通知并刷新备份列表
   */
  handleImportBackup = () => {
    notification.success({
      message: intl.get('status.app.backups.imported'),
      duration: 2
    });
    this.setState({ showImport: false });
    this.fetchBackup();
  };
  /**
 * 取消导入备份操作，关闭导入弹窗并刷新备份列表
 */
  cancelImportBackup = () => {
    this.setState({ showImport: false });
    this.fetchBackup();
  };
  /**
 * 显示恢复备份弹窗
 * @param {object} data - 备份数据对象
 */
  handleRecovery = data => {
    this.setState({
      showRecovery: true,
      backup_id: data.backup_id,
      group_uuid: data.group_uuid
    });
  };
  /**
   * 处理恢复备份操作，关闭恢复弹窗并刷新备份列表
   */
  handleRecoveryBackup = () => {
    this.setState({ showRecovery: false, backup_id: '' });
    this.fetchBackup();
  };
  cancelRecoveryBackup = () => {
    this.setState({ showRecovery: false, backup_id: '' });
    this.fetchBackup();
  };
  /**
   * 显示迁移备份弹窗
   * @param {object} data - 备份数据对象
   */
  handleMove = data => {
    this.setState({
      showMove: true,
      backup_id: data.backup_id,
      group_uuid: data.group_uuid,
      moveBackupMode: data.mode
    });
  };
  /**
   * 处理迁移备份操作，关闭迁移弹窗
   */
  handleMoveBackup = () => {
    this.setState({ showMove: false });
  };
  /**
   * 取消迁移备份操作，关闭迁移弹窗并重置备份 ID
   */
  cancelMoveBackup = () => {
    this.setState({ showMove: false, backup_id: '' });
  };
  /**
 * 处理导出备份操作，生成导出 URL 并下载备份文件
 * @param {object} data - 备份数据对象
 */

  handleExport = data => {
    const { baseInfo } = this.props;
    const exportURl = `${baseInfo.baseUrl
      }/console/teams/${baseInfo?.team_name}/groupapp/${this.getGroupId()}/backup/export?backup_id=${data.backup_id
      }`;
    window.open(exportURl);
    notification.success({
      message: intl.get('status.app.backups.yolkStroke'),
      duration: 2
    });
  };
  /**
* 显示删除备份确认弹窗
* @param {object} data - 备份数据对象
*/
  handleDel = data => {
    this.setState({ showDel: true, backup_id: data.backup_id });
  };
  /**
 * 处理删除备份操作，通过调度 `application/delBackup` action 删除备份并刷新列表
 */
  handleDelete = () => {
    const { dispatch, baseInfo } = this.props;
    this.setState({
      deleteLoading: true
    });
    dispatch && dispatch({
      type: 'application/delBackup',
      payload: {
        team_name: baseInfo?.team_name,
        group_id: this.getGroupId(),
        backup_id: this.state.backup_id
      },
      callback: data => {
        if (data && data.status_code === 200) {
          notification.success({
            message: intl.get('notification.success.delete'),
            duration: 2
          });
        }
        this.cancelDelete();
      },
      handleError: () => {
        this.cancelDelete();
      }
    });
  };
  /**
    * 取消删除操作，关闭删除确认弹窗并重置状态，刷新备份列表
    */
  cancelDelete = () => {
    this.setState(
      { showDel: false, backup_id: '', deleteLoading: false },
      () => {
        this.fetchBackup();
      }
    );
  };
  /**
* 跳转到所有备份页面
*/
  jumpToAllbackup = () => {
    const { jumpRouter, baseInfo } = this.props
    jumpRouter && jumpRouter(`/team/${baseInfo.globalUtile.getCurrTeamName()}/region/${baseInfo.globalUtile.getCurrRegionName()}/allbackup`)
  };
  render() {
    const { baseInfo, user, dispatch, jumpRouter } = this.props
    const {
      list = [],
      operationPermissions: {
        isAccess,
        isAddBackup,
        isImportBackup,
        isRecoverBackup,
        isMoveBackup,
        isExportBackup,
        isDeleteBackup
      },
      loading,
      deleteLoading,
      language
    } = this.state;
    if (!isAccess) {
      return baseInfo?.roleUtil?.noPermission()
    }

    const columns = [
      {
        title: intl.get('appBackups.table.backupsTime'),
        dataIndex: 'create_time'
      },
      {
        title: intl.get('appBackups.table.backupsPerson'),
        dataIndex: 'user'
      },
      {
        title: intl.get('appBackups.table.backupsPattern'),
        dataIndex: 'mode',
        render: val => {
          const map = {
            'full-online': intl.get('appBackups.table.backupsPattern.cloud'),
            'full-offline': intl.get('appBackups.table.backupsPattern.local')
          };
          return map[val] || '';
        }
      },
      {
        title: intl.get('appBackups.table.packetSize'),
        dataIndex: 'backup_size',
        render: val => {
          return sourceUtil.unit(val, 'Byte');
        }
      },
      {
        title: intl.get('appBackups.table.status'),
        dataIndex: 'status',
        render: (val, data) => {
          return (
            <BackupStatus
              onEnd={this.fetchBackup}
              group_id={this.getGroupId()}
              data={data}
              baseInfo={baseInfo}
              currUser={user?.currentUser}
              dispatch={dispatch}
            />
          );
        }
      },
      {
        title: intl.get('appBackups.table.comment'),
        dataIndex: 'note'
      },
      {
        title: intl.get('appBackups.table.operate'),
        dataIndex: 'action',
        render: (_, data) => {
          const isSuccess = data.status === 'success';
          const exportSuccess =
            data.mode === 'full-online' && isSuccess && isExportBackup;
          const box = (text, fun) => {
            return (
              <a
                style={{ marginRight: '5px' }}
                onClick={() => {
                  this[fun](data);
                }}
              >
                {text}
              </a>
            );
          };
          return (
            <div>
              <Fragment>
                {isRecoverBackup && isSuccess && box(intl.get('appBackups.table.btn.recover'), 'handleRecovery')}
                {isMoveBackup && isSuccess && box(intl.get('appBackups.table.btn.removal'), 'handleMove')}
              </Fragment>
              {exportSuccess && box(intl.get('appBackups.table.btn.export'), 'handleExport')}
              {isDeleteBackup && (data.status == "failed" || isSuccess) && box(intl.get('appBackups.table.btn.delete'), 'handleDel')}
            </div>
          );
        }
      }
    ];
    return (
      <div className={styles.Separate_example_content}>
        <Card
          style={{ borderRadius: 5 }}
          className={styles.cardStyle}
          extra={
            <div style={language ? {} : { display: 'flex' }}>
              {isAddBackup &&
                <Button
                  style={language ? { marginRight: 8 } : { marginRight: 8, padding: 6 }}
                  type="primary"
                  onClick={this.onBackup}
                >
                  {intl.get('appBackups.btn.addBackups')}
                </Button>
              }

              {isImportBackup && (
                <Button style={language ? { marginRight: 8 } : { marginRight: 8, padding: 6 }} onClick={this.toAdd}>
                  {intl.get('appBackups.btn.importBackups')}
                </Button>
              )}
            </div>
          }
        >
          <Table
            rowKey={data => {
              return data.backup_id;
            }}
            pagination={this.state.total > this.state.pageSize ? {
              current: this.state.page,
              total: this.state.total,
              pageSize: this.state.pageSize,
              onChange: page => {
                this.setState({ page }, () => {
                  this.fetchBackup();
                });
              }
            } : false}
            columns={columns}
            dataSource={list}
          />
        </Card>
        {this.state.showBackup && (
          <Backup
            warningText={this.state.warningText}
            componentList={this.state.componentList}
            is_configed={this.state.is_configed}
            onOk={this.handleBackup}
            onCancel={this.cancelBackup}
            loading={loading}
          />
        )}
        {this.state.showMove && (
          <MigrationBackup
            onOk={this.handleMoveBackup}
            onCancel={this.cancelMoveBackup}
            backupId={this.state.backup_id}
            groupId={this.getGroupId()}
            currentRegion={baseInfo?.region_name}
            mode={this.state.mode}
            group_uuid={this.state.group_uuid}
            moveBackupMode={this.state.moveBackupMode}
            currUser={this.props.user.currentUser}
            baseInfo={baseInfo}
            dispatch={dispatch}
            jumpRouter={jumpRouter}
          />
        )}
        {this.state.showRecovery && (
          <RestoreBackup
            dispatch={dispatch}
            baseInfo={baseInfo}
            currUser={this.props.user.currentUser}
            onOk={this.handleRecoveryBackup}
            onCancel={this.cancelRecoveryBackup}
            propsParams={{ teamName: baseInfo?.team_name, regionName: baseInfo?.region_name }}
            backupId={this.state.backup_id}
            group_uuid={this.state.group_uuid}
            groupId={this.getGroupId()}
            jumpRouter={jumpRouter}
          />
        )}
        {this.state.showImport && (
          <ImportBackup
            onReLoad={this.handleImportBackup}
            onCancel={this.cancelImportBackup}
            backupId={this.state.backup_id}
            groupId={this.getGroupId()}
            dispatch={dispatch}
            baseInfo={baseInfo}
            currUser={this.props.user.currentUser}
            groupDetail={this.props.application.groupDetail || {}}
            groups={this.props.global.groups}

          />
        )}
        {this.state.showDel && (
          <ConfirmModal
            backupId={this.state.backup_id}
            onOk={this.handleDelete}
            onCancel={this.cancelDelete}
            title={intl.get('confirmModal.backup.title.delete')}
            desc={intl.get('confirmModal.backup.delete.desc')}
            subDesc={intl.get('confirmModal.delete.strategy.subDesc')}
            deleteLoading={deleteLoading}
          />
        )}
      </div>
    )
  }
}
export default WithModifiedProps(index);

