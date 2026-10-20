// pages/index/index.js
Page({
  data: {
    // 初始化 code 为示例代码
    code: `#include<stdio.h> 
int main() 
{ 
    printf("Hello World!\n"); 
    return 0; 
};`,
    history: [],
    output: '',
    currentIndex: -1,
    isHistoryExpanded: false, // 控制历史记录折叠状态
    isCompiling: false, // 标记是否正在编译，防止重复点击
  },

  handleInput(e) {
    this.setData({ code: e.detail.value });
  },

  addToHistory(newCode) {
    const { history, currentIndex } = this.data;
    if (currentIndex !== -1) {
      const updatedHistory = [...history];
      // 如果当前代码已经在历史记录中，先移除后续的记录
      const index = updatedHistory.indexOf(newCode);
      if (index !== -1) {
        updatedHistory.splice(index + 1);
      } else {
        updatedHistory.splice(currentIndex + 1);
      }
      updatedHistory.push(newCode);
      this.setData({ history: updatedHistory, currentIndex: updatedHistory.length - 1 });
    } else {
      this.setData({ history: [newCode], currentIndex: 0 });
    }
  },

  undo() {
    const { currentIndex, history } = this.data;
    if (currentIndex > 0) {
      this.setData({
        code: history[currentIndex - 1],
        currentIndex: currentIndex - 1,
        output: '', // 清空输出，等待重新编译
      });
    } else {
      wx.showToast({ title: '已是最早版本', icon: 'none' });
    }
  },

  redo() {
    const { currentIndex, history } = this.data;
    if (currentIndex < history.length - 1) {
      this.setData({
        code: history[currentIndex + 1],
        currentIndex: currentIndex + 1,
        output: '', // 清空输出，等待重新编译
      });
    } else {
      wx.showToast({ title: '已是最新版本', icon: 'none' });
    }
  },

  async compileCode() {
    const { code } = this.data;
    if (this.data.isCompiling) {
      wx.showToast({ title: '编译中，请稍候', icon: 'none' });
      return;
    }

    this.setData({ isCompiling: true });
    wx.showLoading({ title: '编译中...' });
    try {
      const response = await wx.request({
        url: 'https://localhost:3001/compile',  // 替换为您的服务器地址，使用 http 协议
        method: 'POST',
        data: { code },
        header: { 'Content-Type': 'application/json' },
      });
      if (response.statusCode === 200 && response.data) {
        console.log('Compilation result:', response.data);
        this.setData({ output: response.data.output || '无输出' });
        this.addToHistory(code); // 添加到历史记录
      } else {
        console.error('编译失败，状态码：', response.statusCode, ', 响应数据：', response.data);
        this.setData({ output: response.data ? response.data.error || '服务器未返回预期的响应格式。' : '无法连接到服务器，请检查网络或服务器状态。' });
      }
    } catch (error) {
      console.error('编译过程中发生错误：', error);
      this.setData({ output: '编译请求失败，请检查网络' });
    } finally {
      this.setData({ isCompiling: false });
      wx.hideLoading();
    }
  },

  selectHistory(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      code: this.data.history[index],
      currentIndex: index,
      output: '', // 清空输出，等待重新编译
    });
  },

  toggleHistory() {
    this.setData({
      isHistoryExpanded: !this.data.isHistoryExpanded,
    });
  },
});
