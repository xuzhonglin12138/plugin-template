import request from '../utils/request'

// 接口书写示例
export async function updataPluginInfo(data) {
  return request(
    `/plugin/update`,
    {
      method: 'put',
      data: data
    }
  );
}