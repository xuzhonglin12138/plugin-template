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
        用户端
      </div>
    )
  }
}
export default index