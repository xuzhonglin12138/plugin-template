import { Button, Modal } from 'antd';
import React, { PureComponent } from 'react';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import styles from './index.less';

class ConfirmModal extends PureComponent {
  render() {
    const {
      title,
      onOk,
      onCancel,
      desc,
      subDesc,
      loading = false,
      deleteLoading = false,
      buttonText = false,
    } = this.props;
    return (
      <Modal
        centered
        title={title}
        open
        onOk={onOk}
        onCancel={onCancel}
        className={styles.TelescopicModal}
        footer={[
          <Button onClick={onCancel} key="back">
            {intl.get('popover.cancel')}
          </Button>,
          <Button
            type="primary"
            key="submit"
            loading={loading || deleteLoading}
            disabled={this.props.disabled}
            onClick={onOk}
          >
            {buttonText ? buttonText : intl.get('popover.confirm')}
          </Button>
        ]}
      >
        <div className={styles.content}>
          <div className={styles.inner}>
            <span className={styles.icon}>
              <ExclamationCircleOutlined />
            </span>
            <div className={styles.desc}>
              <p>{desc}</p>
              <p>{subDesc}</p>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}

export default ConfirmModal;
