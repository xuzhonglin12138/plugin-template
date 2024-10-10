import { Button, Form, Input, notification, Spin, Tree } from 'antd';
import React, { PureComponent } from 'react';
import styles from './index.less';

const { TreeNode } = Tree

class RoleList extends PureComponent {
  formRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      rolePermissionItem: null,
      expandedKeys: [],
      autoExpandParent: true,
      checkedKeys: [],
      selectedKeys: [],
      loading: false,
      language: this.props?.baseInfo?.currentLocale == 'zh',
      appKeys: ''
    };
  }

  componentDidMount() {
    const { rolesID, roleList } = this.props;
    if (rolesID) {
      this.loadTeamRolesPermissions(rolesID);
      this.handleRoleName(rolesID, roleList);
    }
  }

  componentDidUpdate(prevProps) {
    const { rolesID, roleList, isAddRole } = this.props;
    if (
      (prevProps.rolesID !== rolesID && rolesID) ||
      (prevProps.isAddRole !== isAddRole && !isAddRole)
    ) {
      this.loadTeamRolesPermissions(rolesID);
      this.handleRoleName(rolesID, roleList);
    }
    if (prevProps.isAddRole !== isAddRole && isAddRole) {
      this.handleResetRoleForm();
    }
  }

  onExpand = expandedKeys => {
    this.setState({
      expandedKeys,
      autoExpandParent: false
    });
  };

  onCheck = checkedKeys => {
    this.setState({ checkedKeys });
  };

  onSelect = selectedKeys => {
    this.setState({ selectedKeys });
  };

  handleResetRoleForm = () => {
    this.setState({
      rolePermissionItem: null,
      expandedKeys: [],
      autoExpandParent: true,
      checkedKeys: [],
      selectedKeys: []
    });
    this.formRef.current.resetFields();
  };

  handleAddRole = values => {
    const { dispatch, baseInfo } = this.props;
    dispatch && dispatch({
      type: 'teamControl/createRole',
      payload: {
        team_name: baseInfo?.team_name,
        name: values.name
      },
      callback: res => {
        if (res && res.status_code === 200) {
          return this.loadTeamRolesPermissions(res.bean.ID, true);
        }
        this.handleCloseLoading();
      }
    });
  };

  loadTeamRolesPermissions = (ID, isEditor = false) => {
    const { dispatch, baseInfo } = this.props;
    dispatch && dispatch({
      type: 'teamControl/fetchTeamRolesPermissions',
      payload: {
        team_name: baseInfo?.team_name,
        role_id: ID
      },
      callback: res => {
        if (res && res.status_code === 200) {
          const rolePermissions = (res.bean && res.bean.permissions) || null;
          if (rolePermissions) {
            this.handlePermissions(res.bean, isEditor);
          }
        }
      }
    });
  };

  handlePermissions = (rolePermissions, isEditor) => {
    const { permissions } = this.props;
    const { checkedKeys } = this.state;
    const arr = [];
    const rolePermissionItem = rolePermissions;
    if (permissions) {
      this.handlePermissionsSubmodels(
        permissions.team.sub_models,
        rolePermissionItem.permissions.team.sub_models,
        arr,
        false
      );
    }
    if (checkedKeys) {
      if (isEditor) {
        this.setState({ rolePermissionItem },
          () => {
            this.handleRolePermissions(rolePermissionItem);
          }
        );
      } else {
        this.setState({
          expandedKeys: arr,
          checkedKeys: arr,
          autoExpandParent: true
        });
      }
    }
  };

  handlePermissionsSubmodels = (data, roleData, arr) => {
    const { checkedKeys } = this.state;
    const { appKeys } = this.state;
    data.forEach(item => {
      roleData.forEach(items => {
        const keys = Object.keys(item)[0];
        const rolekeys = Object.keys(items)[0];
        const regex = /^app_\d+/;
        if (regex.test(keys)) {
          this.setState({ appKeys: keys });
        }
        const regexs = /^app_/;
        const isApp = regexs.test(keys);
        if (keys === rolekeys) {
          if (item[keys].sub_models && item[keys].sub_models.length > 0) {
            return this.handlePermissionsSubmodels(
              item[keys].sub_models,
              items[rolekeys].sub_models,
              arr
            );
          }
          item[keys].perms.forEach(itemParent => {
            items[rolekeys].perms.forEach(itemchild => {
              const { code, name } = itemParent;
              const objKey = Object.keys(itemchild)[0];
              if (objKey === name) {
                if (itemchild[name]) {
                  isApp ? arr.push(`${appKeys}_${code}`) : arr.push(`${code}`);
                }
                if (checkedKeys) {
                  if (isApp) {
                    itemchild[name] = checkedKeys.includes(`${appKeys}_${code}`);
                  } else {
                    itemchild[name] = checkedKeys.includes(`${code}`);
                  }
                }
              }
            });
          });
        }
      });
    });
  };

  handleRoleName = (ID, roleList) => {
    const { language } = this.state;
    const { baseInfo } = this.props;
    if (roleList && roleList.length > 0) {
      const roles = roleList.filter(item => `${item.ID}` === `${ID}`);
      if (roles && roles.length > 0) {
        this.formRef.current.setFieldsValue({ name: baseInfo?.roleUtil.actionMap(roles[0].name, language) });
      }
    }
  };

  handleEditRole = values => {
    const { dispatch, rolesID, baseInfo } = this.props;
    dispatch && dispatch({
      type: 'teamControl/editRole',
      payload: {
        team_name: baseInfo?.team_name,
        role_id: rolesID,
        name: values.name
      },
      callback: res => {
        if (res && res.status_code === 200) {
          return this.loadTeamRolesPermissions(res.bean.ID, true);
        }
        this.handleCloseLoading();
      }
    });
  };

  handleRolePermissions = values => {
    if (values) {
      const { dispatch, onCancelAddRole, isAddRole, formatMessage, baseInfo } = this.props;
      dispatch && dispatch({
        type: 'teamControl/updateRolePermissions',
        payload: {
          team_name: baseInfo?.team_name,
          role_id: values.role_id,
          permissions: values.permissions
        },
        callback: res => {
          if (res && res.status_code === 200) {
            onCancelAddRole(parseInt(res.bean.role_id));
            notification.success({
              message: isAddRole
                ? formatMessage({ id: 'notification.success.setUp' })
                : formatMessage({ id: 'notification.success.edit' })
            });
          }
          this.handleCloseLoading();
        }
      });
    }
  };

  handleCloseLoading = () => {
    this.setState({ loading: false });
  };

  handleSubmit = () => {
    this.formRef.current.validateFields().then(values => {
      const { isAddRole } = this.props;
      this.setState({ loading: true }, () => {
        if (isAddRole) {
          this.handleAddRole(values);
        } else {
          this.handleEditRole(values);
        }
      });
    });
  };
  /**
   * 递归渲染树节点。
   * 根据传入的数据递归生成Ant Design Tree节点，支持展示应用程序名称和权限项。
   * 
   * @param {Array} data - 渲染的数据数组
   * @param {string} language - 语言选项
   * @param {object} fatherArr - 父节点数据，默认为空对象
   * @returns {ReactNode} 返回渲染的树节点
   */
  renderTreeNodes = (data, language, fatherArr = {}) => {
    if (data && data.length > 0) {
      const arr = data.map((item, index) => {
        const keys = Object.keys(item)[0];
        const regexs = /^app_\d+/;
        const showAppName = regexs.test(keys)
        const regex = /^app_/;
        const isApp = regex.test(keys);
        const treeKeys = Object.keys(fatherArr)[0] || ''
        if (item[keys].sub_models && item[keys].sub_models.length > 0) {
          const isAppGateway = keys == 'app_gateway_manage' ? true : false;
          return (
            <TreeNode key={keys + treeKeys} title={showAppName ? this.findApp(keys) : this.props.baseInfo?.roleUtil.fetchAccessText(keys, language)}>
              {this.renderTreeNodes(item[keys].sub_models, language, isAppGateway ? fatherArr : data[index])}
            </TreeNode>
          )
        }
        return (
          <TreeNode key={keys + treeKeys} title={this.props.baseInfo?.roleUtil.fetchAccessText(keys, language)}>
            {item[keys].perms.map(item2 => {
              if (isApp) {
                const treeKeys = Object.keys(fatherArr)[0]
                return <TreeNode key={treeKeys + '_' + item2.code} title={language ? item2.desc : item2.name} />;
              }
              return <TreeNode key={item2.code} title={language ? item2.desc : item2.name} />;
            })}
          </TreeNode>
        )
      });
      return arr
    }
  }


  findApp = keys => {
    const { appList } = this.props;
    const match = keys.match(/_(\d+)/);
    let appNames = '';
    (appList || []).forEach(item => {
      if (item.group_id === match[1]) {
        appNames = item.group_name;
      }
    });
    return appNames || keys;
  };

  handleSubmitButton = (loading, isAddRole) => {
    const { formatMessage } = this.props
    return (
      <Button loading={loading} type="primary" onClick={this.handleSubmit}>
        {isAddRole
          ? formatMessage({ id: 'teamManage.tabs.role.list.permissions.add' })
          : formatMessage({ id: 'teamManage.tabs.role.list.permissions.edit' })}
      </Button>
    );
  };

  render() {
    const {
      permissions,
      permissionsLoading,
      isAddRole,
      onCancelAddRole,
      isEdit,
      isCreate,
      formatMessage
    } = this.props;
    const {
      expandedKeys,
      autoExpandParent,
      checkedKeys,
      selectedKeys,
      loading,
      language
    } = this.state;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 }
      }
    };

    return (
      <Form ref={this.formRef}>
        <Spin spinning={permissionsLoading}>
          <div className={styles.AuthModuleWrap}>
            <Form.Item {...formItemLayout} label={formatMessage({ id: 'teamManage.tabs.role.list.permissions.roleName' })}>
              <Form.Item name="name"
                noStyle
                rules={[
                  { required: true, message: formatMessage({ id: 'placeholder.roleName' }) },
                  { max: 32, message: formatMessage({ id: 'placeholder.max32' }) }
                ]}>
                <Input placeholder={formatMessage({ id: 'placeholder.roleName' })} />
              </Form.Item>
            </Form.Item>
            {permissions && (
              <Form.Item {...formItemLayout} label={formatMessage({ id: 'teamManage.tabs.role.list.permissions.allot' })}>
                <Tree
                  checkable
                  className={styles.tree}
                  onExpand={this.onExpand}
                  expandedKeys={expandedKeys}
                  autoExpandParent={autoExpandParent}
                  onCheck={this.onCheck}
                  checkedKeys={checkedKeys}
                  onSelect={this.onSelect}
                  selectedKeys={selectedKeys}
                >
                  {this.renderTreeNodes(permissions?.team?.sub_models, language)}
                </Tree>
              </Form.Item>
            )}
          </div>
        </Spin>

        <div className={styles.systemFormBtn}>
          {isAddRole && (
            <Button onClick={onCancelAddRole} style={{ marginRight: '20px' }}>
              {formatMessage({ id: 'teamManage.tabs.role.list.permissions.btn.cancel' })}
            </Button>
          )}
          {!isAddRole && isEdit && this.handleSubmitButton(loading, isAddRole)}
          {isCreate && isAddRole && this.handleSubmitButton(loading, isAddRole)}
        </div>
      </Form>
    );
  }
}

export default RoleList;
