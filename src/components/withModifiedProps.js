import React from 'react';

const withModifiedProps = (WrappedComponent) => {
  class HOC extends React.Component {
    modifyProps = (props) => {
      const {reduxInfo}=props
      const newProps = {
        ...props,
        ...reduxInfo
      };
      return newProps;
    }

    render() {
      const modifiedProps = this.modifyProps(this.props);
      return <WrappedComponent {...modifiedProps} />;
    }
  }

  // 设置 displayName，便于调试
  HOC.displayName = `withModifiedProps(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return HOC;
};

export default withModifiedProps;
