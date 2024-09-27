import React from 'react';
import {
  Modal,
  Button,
  Form,
  Radio,
  Tooltip,
  Input,
  Alert,
  List
} from 'antd';
import intl from 'react-intl-universal';
import styles from './index.less';

const { TextArea } = Input;

const Backup = ({
  data = {},
  is_configed,
  componentList,
  warningText,
  onCancel,
  onOk,
  loading = false
}) => {
  const [form] = Form.useForm();  // 使用 useForm 来创建表单实例
  const cloudBackupTip = is_configed
    ? intl.get('appBackups.table.pages.is_configed')
    : intl.get('appBackups.table.pages.no_configed');

  // 表单提交处理逻辑
  const handleSubmit = async () => {
    try {
      const fieldsValue = await form.validateFields(); // validateFields 验证表单
      const obj = { ...fieldsValue };

      if (warningText) {
        obj.force = true;
      }

      if (onOk) {
        onOk(obj);
      }
    } catch (err) {
      console.log('Validation Failed:', err);
    }
  };

  return (
    <Modal
      title={intl.get('appBackups.btn.addBackups')}
      open
      className={styles.TelescopicModal}
      onOk={handleSubmit}
      onCancel={onCancel}
      footer={[
        <Button onClick={onCancel} key="back">
          {intl.get('popover.cancel')}
        </Button>,
        <Button
          type="primary"
          onClick={handleSubmit}
          loading={loading}
          key="submit"
        >
          {warningText ? intl.get('button.forced_backup') : intl.get('popover.confirm')}
        </Button>
      ]}
    >
      <Form
        form={form}
        layout="horizontal"
        initialValues={{
          mode: is_configed ? data?.mode || 'full-online' : 'full-offline',
          note: data?.note || ''
        }}
      >
        <Form.Item
          label={<span>{intl.get('appBackups.table.pages.label.mode')}</span>}
          name="mode"
          rules={[{ required: true, message: intl.get('placeholder.app_not_name') }]}
        >
          <Radio.Group>
            <Tooltip title={cloudBackupTip} placement="top" overlayClassName={styles.TooltipStyle} >
              <Radio.Button disabled={!is_configed} value="full-online">
                {intl.get('appBackups.table.pages.label.full-online')}
              </Radio.Button>
            </Tooltip>
            <Tooltip title={intl.get('appBackups.table.pages.label.tooltip.title')}placement="top"overlayClassName={styles.TooltipStyle}>
              <Radio.Button value="full-offline">
                {intl.get('appBackups.table.pages.label.full-offline')}
              </Radio.Button>
            </Tooltip>
          </Radio.Group>

        </Form.Item>

        <Form.Item
          label={intl.get('appBackups.table.pages.label.note')}
          name="note"
          rules={[{ required: true, message: intl.get('placeholder.backup.note') }]}
        >
          <TextArea placeholder={intl.get('placeholder.backup.note')} />
        </Form.Item>
        {warningText && (
          <div>
            <Alert message={warningText} type="warning" />
            <List
              size="small"
              style={{ margin: '10px 0' }}
              header={
                <h6 style={{ marginBottom: '0', fontSize: '15px' }}>
                  {intl.get('appDynamic.table.componentName')}
                </h6>
              }
              bordered
              dataSource={componentList}
              renderItem={(item) => <List.Item>{item}</List.Item>}
            />
          </div>
        )}
      </Form>

    </Modal>
  );
};


export default Backup;


