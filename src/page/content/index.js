import React, { Component } from 'react'
import styles from './index.less';

 class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pluginInfo: {}
    }
  }
  componentDidMount() {

  }
  render() {
    return (
      <div className={styles.Separate_example_root}>
        管理端 或 只有一端
      </div>
    )
  }
}
export default index