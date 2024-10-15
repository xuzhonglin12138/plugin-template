import { Button, Empty, Spin, Menu, Card } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import React, { Fragment, PureComponent } from 'react';
import ConfirmModal from '../../components/ConfirmModal';
import PermissionsForm from '../../components/PermissionsFrom'
import styles from './index.less';
export default class RoleList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showAddRole: false,
      roleList: [],
      rolesID: null,
      rolesLoading: true,
      permissions: null,
      permissionsLoading: true,
      language: true,
      applist: []
    };
  }

  componentDidMount() {
    this.loadPermissions();
    this.loadTeamRoles();
    this.fetchTeamApps();
  }

  onDelRole = (item) => {
    this.setState({ deleteRole: item });
  };

  fetchTeamApps = () => {
    const { baseInfo, dispatch } = this.props
    dispatch && dispatch({
      type: 'global/fetchGroups',
      payload: {
        team_name: baseInfo?.team_name || baseInfo?.globalUtile.getCurrTeamName(),
        region_name: baseInfo?.region_name || baseInfo?.globalUtile.getCurrRegionName()
      },
      callback: res => {
        this.setState({
          applist: res.list || []
        })
      }
    });
  };

  showAddRole = () => {
    this.setState({ showAddRole: true });
  };

  hideAddRole = (ID) => {
    this.setState({ showAddRole: false });
    if (ID && typeof ID === 'number') {
      return this.loadTeamRoles(ID);
    }
  };

  handleDelRole = () => {
    const { baseInfo, dispatch } = this.props

    dispatch && dispatch({
      type: 'teamControl/removeRole',
      payload: {
        team_name: baseInfo?.team_name || baseInfo?.globalUtile.getCurrTeamName(),
        role_id: this.state.deleteRole.ID
      },
      callback: () => {
        this.hideDelRole();
        this.loadTeamRoles();
      }
    });
  };

  hideDelRole = () => {
    this.setState({ deleteRole: null });
  };

  loadTeamRoles = (rolesID = false) => {
    const { dispatch, baseInfo } = this.props;
    dispatch && dispatch({
      type: 'teamControl/fetchTeamRoles',
      payload: {
        team_name: baseInfo?.team_name || baseInfo?.globalUtile.getCurrTeamName(),
      },
      callback: (res) => {
        if (res && res.status_code === 200) {
          let ID = null;
          if (res.list && res.list.length > 0) {
            ID = res.list[0].ID;
          }
          this.setState({
            roleList: res.list,
            rolesID: rolesID || ID,
            rolesLoading: false
          });
        }
      }
    });
  };

  loadPermissions = () => {
    const { dispatch, index } = this.props;
    dispatch && dispatch({
      type: 'global/fetchPermissions',
      payload: {
        tenant_id: index?.overviewInfo?.team_id
      },
      callback: (res) => {
        if (res && res.status_code === 200) {
          this.setState({
            permissions: res.bean || [],
            permissionsLoading: false
          });
        }
      }
    });
  };

  selectKey = ({ key }) => {
    this.setState({
      rolesID: key
    });
  };

  render() {
    const {
      baseInfo,
      formatMessage,
      componentData: {
        rolePermissions: { isCreate, isDelete, isEdit }
      },
      dispatch,
    } = this.props;
    const {
      roleList,
      rolesLoading,
      permissions,
      permissionsLoading,
      showAddRole,
      rolesID,
      deleteRole,
      language,
      applist
    } = this.state;
    const roles = roleList && roleList.length > 0;
    return (
      <Fragment>
        <div className={styles.permissionBox}>
          <Card
            title={formatMessage({ id: 'teamManage.tabs.role.title' })}
            bordered
            className={styles.systemRoleWrapper}
          >
            <Spin spinning={rolesLoading}>
              {roleList && roleList.length > 0 && (
                <Menu
                  mode="inline"
                  selectedKeys={[`${rolesID}`]}
                  onClick={this.selectKey}
                  style={{ borderTop: 0, borderInlineEnd: 0 }}
                >
                  {roleList.map((item) => {
                    const { ID, name } = item;
                    return (
                      <Menu.Item key={ID} disabled={showAddRole}>
                        <div>{baseInfo?.roleUtil?.actionMap(name, language)}</div>
                        {isDelete && (
                          <DeleteOutlined
                            style={{ color: '#ff4d4f', marginLeft: '10px' }}
                            onClick={() => this.onDelRole(item)}
                          />
                        )}
                      </Menu.Item>
                    );
                  })}
                </Menu>
              )}
            </Spin>
            <div className={styles.systemRoleBtn}>
              {!showAddRole && isCreate && (
                <Button type="primary" icon={<PlusOutlined />} onClick={this.showAddRole}>
                  {formatMessage({ id: 'teamManage.tabs.role.btn.add' })}
                </Button>
              )}
            </div>
          </Card>
          <Card
            title={formatMessage({ id: 'teamManage.tabs.role.list.permissions' })}
            bordered
            className={styles.authSettingBody}
          >
            {!roles && permissionsLoading && !showAddRole ? (
              <div className={styles.noRole}>
                <Empty />
              </div>
            ) : (
              <PermissionsForm
                key={permissions}
                appList={applist}
                baseInfo={baseInfo}
                dispatch={dispatch}
                formatMessage={formatMessage}
                isEdit={isEdit}
                isCreate={isCreate}
                isAddRole={showAddRole}
                onCancelAddRole={this.hideAddRole}
                rolesID={rolesID}
                roleList={roleList}
                permissions={permissions}
                permissionsLoading={permissionsLoading}
              />
            )}
          </Card>

        </div>

        {deleteRole && (
          <ConfirmModal
            onOk={this.handleDelRole}
            title={formatMessage({ id: 'confirmModal.role.delete.title' })}
            subDesc={formatMessage({ id: 'confirmModal.delete.strategy.subDesc' })}
            desc={formatMessage({ id: 'confirmModal.delete.role.desc' }, { deleteRole: deleteRole.name })}
            onCancel={this.hideDelRole}
          />
        )}
      </Fragment>
    );
  }
}
