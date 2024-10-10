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
        <h1>======团队和组件========</h1>
        <h5>当前是组件</h5>
        <p>团队和组件团队和组件团队和组件团队和组件团队和组件团队和组件团队和组件</p>
      </div>
    )
  }
}
export default index