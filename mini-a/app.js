// app.js
App({
  onLaunch() {
    // 初始化代码

    // 1. 检查并创建日志目录（修复路径格式）
    // 使用动态路径适配不同平台
    let logDir = `${wx.env.USER_DATA_PATH}/miniprogramLog/`;
    const fs = wx.getFileSystemManager();

    // 确保路径不以双斜杠开头
    if (logDir.startsWith('//')) {
      console.warn('日志目录路径以双斜杠开头，已调整');
      logDir = logDir.slice(1); // 移除第一个斜杠
    }

    fs.access({
      path: logDir,
      success: () => {
        console.log('日志目录已存在');
      },
      fail: (res) => { // 捕获访问失败原因
        if (res.errno === -1) { // 目录不存在的情况
          fs.mkdir({
            path: logDir,
            success: () => {
              console.log('日志目录创建成功');
            },
            fail: (err) => {
              console.error('创建日志目录失败：', err);
            }
          });
        } else {
          console.error('检查目录失败：', res.errMsg);
        }
      }
    });

    // 2. 调用合法API（移除不存在的私有API）
    const apiParams = {
      dataType: 'string',
      encrypt: true,
      // 补充完整必填参数...
    };

    console.log('API参数：', apiParams);

    wx.startLocalServiceDiscovery({
      serviceType: '_http._tcp',
      success: function(res) {
        console.log('服务发现成功', res);
      },
      fail: function(err) {
        console.error('服务发现失败', err);
      }
    });

    // 3. 发送编译请求（避免在 onLaunch 中发送网络请求，建议移至页面逻辑）
    // 此部分代码已移除，建议在具体页面中处理
  }
});

