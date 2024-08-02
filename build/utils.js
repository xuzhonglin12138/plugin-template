const fs = require('fs');
const path = require('path');
const NODE_ENV = process.env.NODE_ENV

module.exports = {
  // 获取入口文件
  getEntryFile: function () {
    return NODE_ENV !== 'development' ? path.join(__dirname, '..', 'src', 'moudle.js') : path.join(__dirname, '..', 'src', 'index.js');
  },
  // 检查是否有README文件
  hasReadme: function () {
    return fs.existsSync(path.resolve(process.cwd(), 'src', 'README.md'));
  },
  // 获取packagejson文件信息
  getPackageJsonInfo: function () {
    return require(path.resolve(process.cwd(), 'package.json'));
  },
  // 获取插件ID
  getPluginId: function () {
    const { id } = require(path.resolve(process.cwd(), `src/pluginData.json`));
    return id;
  },
  // 获取当前日期
  getTodayDate: function(){
    return new Date().toISOString().substring(0, 10)
  }
};