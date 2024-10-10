import React, { Component } from 'react'
import {
  Row,
  Col,
  Button,
  Table,
  Skeleton,
  Modal,
  Upload,
  Form,
  Input,
  Tabs,
  Pagination,
  notification,
  Menu
} from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import withModifiedProps from '../../components/withModifiedProps';
import ConfirmModal from '../../components/ConfirmModal';
import styles from './index.less'

const { TabPane } = Tabs;

class UploadComponent extends Component {
  formRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      activeKey: "openJDK",
      tableLoading: false,
      modalVisible: false,
      delLangeVisible: false,
      delLangeLongin: false,
      clusterUrl: '',
      tableList: [],
      fileList: [],
      fileInfo: {},
      currentPage: 1,
      pageSize: 10,
      totalList: [],
      cluster_info: this.props?.region?.cluster_info || []
    };
  }

  componentDidMount() {
    const { cluster_info } = this.state
    console.log(this.props,"this.props===");
    if (cluster_info.length > 0) {
      this.setState({
        regionID: cluster_info[0].region_id
      }, () => {
        this.fetchPakeVs()
        this.loadPutCluster()
      })
    }
  }
  /**
   * 加载集群信息的函数
   * 根据当前区域ID获取集群信息，并处理WebSocket地址用于文件上传
   */
  loadPutCluster = () => {
    const {
      dispatch,
      baseInfo
    } = this.props;
    const { regionID } = this.state;
    dispatch && dispatch({
      type: 'region/fetchEnterpriseCluster',
      payload: {
        enterprise_id: baseInfo?.globalUtile.getCurrEnterpriseId(),
        region_id: regionID
      },
      callback: res => {
        if (res && res.status_code === 200) {
          this.setState({
            clusterUrl: baseInfo.baseUrl + '/console/enterprise/lg_pack_operate'
          })
        }
      }
    });
  };
  /**
   * 获取语言包版本的函数
   * 根据当前区域ID和语言类型获取语言包版本列表
   * @param {string} [region_id] - 区域ID，可选，默认使用state中的regionID
   */
  fetchPakeVs = (region_id) => {
    this.setState({
      currentPage: 1,
      totalList: [],
      tableLoading: true
    })
    const { activeKey, regionID, currentPage, pageSize } = this.state
    const { dispatch, baseInfo } = this.props
    dispatch && dispatch({
      type: 'global/fetchLanguageVersion',
      payload: {
        enterprise_id: baseInfo?.globalUtile?.getCurrEnterpriseId(),
        region_id: region_id || regionID,
        data: {
          language: activeKey
        }
      },
      callback: res => {
        if (res) {
          // 将list中first_choice 为true 的版本放在数组的第一位
          let default_list
          let first_choice = res.list.filter(item => item.first_choice)
          let newList = res.list.filter(item => !item.first_choice)
          newList.unshift(...first_choice)
          default_list = newList.slice((currentPage - 1) * pageSize, currentPage * pageSize)
          this.setState({
            tableList: default_list,
            totalList: newList,
            tableLoading: false
          })
        }

      },
      handleError: () => {
        this.setState({
          tableList: [],
          tableLoading: false
        })
      }
    });
  }
  handleOk = (e) => {
    e.preventDefault();
    const { fileInfo, regionID } = this.state;
    const { baseInfo, dispatch } = this.props;
    this.formRef.current.validateFields().then(values => {
      if (Object.keys(fileInfo).length || values.lang === 'net_runtime' || values.lang === 'net_sdk') {
        values.event_id = fileInfo.event_id || '';
      }
      dispatch && dispatch({
        type: 'global/uploadLanguageFile',
        payload: {
          enterprise_id: baseInfo?.globalUtile.getCurrEnterpriseId(),
          region_id: regionID,
          data: {
            language: values.lang,
            version: values.version,
            event_id: values.event_id || '',
            file_name: values.file_name ? values.file_name.replace(/\s/g, '') : ''
          }
        },
        callback: res => {
          if (res && res.status_code === 200) {
            notification.success({ message: this.props.formatMessage({ id: 'notification.success.succeeded' }) });
            this.setState({
              modalVisible: false,
              fileInfo: {},
              fileList: [],
            }, () => {
              this.fetchPakeVs();
            });
          } else if (res && res.status_code === 400) {
            notification.warning({ message: res.msg_show });
          }
        }
      });
    });
  };

  handleCancel = () => {
    this.formRef.current.resetFields(); // 重置表单
    this.setState({
      modalVisible: false,
      fileInfo: {},
      fileList: [],
    });
  };

  tabsChange = (key) => {
    this.setState({
      activeKey: key,
    }, () => {
      this.loadPutCluster();
      setTimeout(() => {
        this.fetchPakeVs();
      }, 500);
    });
  };
  /**
* 协议替换函数
* 将ws/wss协议地址转换为http/https协议地址
* @param {string} address - 原始地址
* @returns {string} 转换后的地址
*/
  replaceProtocol = (address) => {
    if (address.startsWith('ws:')) {
      return address.replace('ws:', 'http:');
    } else if (address.startsWith('wss:')) {
      return address.replace('wss:', 'https:');
    } else {
      return address;
    }
  }
  /**
* 设置语言包隐藏状态的函数
* 控制语言包版本的显示/隐藏状态
* @param {Object} row - 版本信息对象
*/
  setHidden = (row) => {
    const { dispatch, baseInfo } = this.props;
    const { regionID, activeKey } = this.state
    dispatch && dispatch({
      type: 'global/editLanguageDefault',
      payload: {
        enterprise_id: baseInfo?.globalUtile.getCurrEnterpriseId(),
        region_id: regionID,
        data: {
          language: activeKey,
          version: row.version,
          show: !row.show,
          first_choice: row.first_choice
        }
      },
      callback: res => {
        if (res && res.status_code === 200) {
          this.fetchPakeVs()
          notification.success({ message: '修改成功' });
        }
      },
      handleError: err => {
        notification.error({ message: err?.data?.msg_show || '操作失败' });
        this.fetchPakeVs()
        this.setState({
          tableLoading: false
        })
      }
    });
  }
  /**
* 删除语言包版本的确认处理函数
* 删除指定版本的语言包文件
* @param {Object} row - 版本信息对象
*/
  confirm = () => {
    const { dispatch, baseInfo } = this.props;
    const { regionID, delLangeVisible } = this.state
    this.setState({ delLangeLongin: true })
    dispatch && dispatch({
      type: 'global/deleteLanguageFile',
      payload: {
        enterprise_id: baseInfo?.globalUtile.getCurrEnterpriseId(),
        region_id: regionID,
        data: {
          language: delLangeVisible.lang,
          version: delLangeVisible.version,
        }
      },
      callback: res => {
        if (res && res.status_code === 200) {
          this.fetchPakeVs()
          this.setState({ delLangeLongin: true, delLangeVisible: false })
          notification.success({ message: '删除成功' });
        }
      },
      handleError: err => {
        notification.error({ message: err?.data?.msg_show || '操作失败' });
        this.fetchPakeVs()
        this.setState({
          tableLoading: false,
          delLangeLongin: false
        })
      }
    });
  }

  onChangeUpload = info => {
    let { fileList } = info;
    fileList = fileList.slice(-1)
    fileList = fileList.filter(file => {
      if (file.response) {
        notification.success({ message: '上传成功' });
        this.setState({ fileInfo: file.response.bean });
        return file.response.msg === 'success';
      }
      return true;
    });
    this.setState({ fileList });
  };
  /**
* 时间戳格式化函数
* 将时间戳字符串转换为易读的日期时间格式
* @param {string|number} timestampStr - 时间戳字符串或数字
* @returns {string} 格式化后的日期时间字符串
*/
  formatTimestamp = (timestampStr) => {
    // 创建Date对象
    const date = new Date(timestampStr);

    // 获取年、月、日、时、分、秒
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // getMonth返回的月份是从0开始的，所以需要+1
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const seconds = ('0' + date.getSeconds()).slice(-2);

    // 格式化输出
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  /**
   * 分页器变化执行函数
   * 根据pageSize获取语言包版本数据列表
   */
  onPageChange = (page) => {
    const { pageSize } = this.state
    this.setState({
      currentPage: page,
      tableList: this.state.totalList.slice((page - 1) * pageSize, page * pageSize)
    })
  }

  handleOnOk = (row) => {
    this.setState({ delLangeVisible: row })
  }
  handleOnCancel = () => {
    this.setState({ delLangeVisible: false })
  }
  menuClick=(item)=>{
    this.setState({ activeKey: item.key }, () => this.fetchPakeVs())
  }

  render() {
    const { activeKey, modalVisible, fileList, fileInfo, currentPage, pageSize, totalList, cluster_info } = this.state;
    const { baseInfo } = this.props
    const myheaders = {};
    const token = baseInfo.token
    if (token) {
      myheaders.Authorization = `GRJWT ${token}`;
    }
    const columns = [
      {
        title: '版本',
        dataIndex: 'version',
        key: 'version',
        ellipsis: true,
      },
      {
        title: (activeKey === 'net_sdk' || activeKey === 'net_runtime') ? '镜像名称' : '文件名',
        dataIndex: 'file_name',
        key: 'file_name',
        render: i => <span>{i || '-'}</span>
      },
      {
        title: '创建时间',
        dataIndex: 'create_time',
        key: 'create_time',
        render: i => <span>{this.formatTimestamp(i) || '-'}</span>
      },
      {
        title: '操作',
        dataIndex: 'handle',
        key: 'handle',
        render: (item, row) => (
          <>
            {row.show && <a disabled={row.first_choice} onClick={() => this.setDefault(row)}>设为默认</a>}
            {row.show && !row.first_choice && <span style={{ color: '#DCDFE6', margin: '0 8px' }}>|</span>}
            {!row.first_choice && <a onClick={() => this.setHidden(row)}>{row.show ? '隐藏' : '显示'}</a>}
            {!row.system && !row.first_choice && <>
              <span style={{ color: '#DCDFE6', margin: '0 8px' }}>|</span>
              <a onClick={() => this.handleOnOk(row)}>删除</a>
            </>}
          </>
        )
      },
    ];
    const items = [
      {
        key: 'openJDK',
        label: 'JDK',
      },
      {
        key: 'maven',
        label: 'Maven',
      },
      {
        key: 'golang',
        label: 'Golang',
      },
      {
        key: 'node',
        label: 'Node',
      },
      {
        key: 'java_server',
        label: 'JavaServer',
      },
      {
        key: 'web_runtime',
        label: 'WebRuntime',
      },
      {
        key: 'python',
        label: 'Python',
      },
      {
        key: 'net_sdk',
        label: '.NetSDK',
      },
      {
        key: 'net_runtime',
        label: '.NetRuntime',
      },
    ];

    return (
      <>
        {cluster_info.length > 0 ? (
          <Tabs onChange={this.tabsChange} className={styles.UploadtabsStyle}>
            {cluster_info.map(item => (
              <TabPane tab={item.region_alias} key={item.region_id} />
            ))}
          </Tabs>
        ) : (
          <div>请先选择集群</div>
        )}
        <Row>
          <Col span={3}>
            <div className={styles.leftBox}>
              <Menu
                defaultSelectedKeys={['openJDK']}
                onClick={this.menuClick}
                items={items}
              />
            </div>
          </Col>
          <Col span={21}>
            <div className={styles.rightBox}>
              <Row>
                <Button
                  type='primary'
                  icon={<PlusOutlined />}
                  onClick={() => this.setState({ modalVisible: true })}
                >
                  添加版本
                </Button>
              </Row>
              <Skeleton active loading={this.state.tableLoading}>
                <Table dataSource={this.state.tableList} columns={columns} pagination={false} rowKey="ID" />
                <Pagination
                  style={{ margin: '20px 0', float: 'right' }}
                  size="default"
                  current={currentPage}
                  pageSize={pageSize}
                  total={totalList.length}
                  onChange={this.onPageChange}
                />
              </Skeleton>
            </div>
          </Col>
        </Row>
        <Modal
          centered
          title="语言包上传"
          open={modalVisible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          destroyOnClose={true}
        >
          <Form ref={this.formRef} onFinish={this.handleOk}>
            <Form.Item label="语言类型" name="lang" initialValue={activeKey} rules={[{ required: true }]}>
              <Input disabled />
            </Form.Item>
            <Form.Item
              label="版本号"
              name="version"
              rules={[
                { required: true, message: '请填写版本号' },
                { pattern: /^[a-zA-Z0-9_.-]+$/, message: '版本号格式不正确' },
                { max: 64, message: '版本号长度不能超过64位' },
                {
                  validator: (_, value) => {
                    return this.state.tableList.some(item => item.version === value)
                      ? Promise.reject(new Error('版本号重复'))
                      : Promise.resolve();
                  },
                },
              ]}
            >
              <Input />
            </Form.Item>
            {(activeKey === 'net_runtime' || activeKey === 'net_sdk') ? (
              <Form.Item
                label="镜像地址"
                name="file_name"
                rules={[
                  { required: true, message: '请填写镜像地址' },
                  { pattern: /^[^\u4e00-\u9fa5]+$/, message: '镜像地址格式不正确' },
                  {
                    validator: (_, value) => {
                      return this.state.tableList.some(item => item.file_name === value)
                        ? Promise.reject(new Error('镜像地址重复'))
                        : Promise.resolve();
                    },
                  },
                ]}
              >
                <Input />
              </Form.Item>
            ) : (
              <>
                <Form.Item label="上传文件" name="file" rules={[{ required: true }]}>
                  <Upload
                    fileList={fileList}
                    headers={myheaders}
                    name="file"
                    onChange={this.onChangeUpload}
                    action={this.state.clusterUrl}
                    accept='.jar,.gz'
                    data={{ region_id: this.state.regionID, enterprise_id: baseInfo?.globalUtile.getCurrEnterpriseId() }}
                  >
                    <Button icon={<UploadOutlined />}>上传文件</Button>
                    <div className={styles.uploadtext}>仅支持上传 jar, tar.gz 格式的文件</div>
                  </Upload>
                </Form.Item>
                {fileInfo.file_name && (
                  <Form.Item label="文件名" name="file_name" initialValue={fileInfo.file_name}>
                    <Input disabled />
                  </Form.Item>
                )}
              </>
            )}
          </Form>
        </Modal>
        {this.state.delLangeVisible && (
          <ConfirmModal
            title="删除语言版本"
            subDesc="删除后将无法恢复"
            desc={`确定删除${this.state.delLangeVisible.lang}语言${this.state.delLangeVisible.version}版本吗？`}
            onOk={this.confirm}
            onCancel={this.handleOnCancel}
          />
        )}
      </>
    );
  }
}

export default  withModifiedProps(UploadComponent);
