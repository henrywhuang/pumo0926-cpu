App({
  globalData: {
    envId: "请替换为云开发环境ID",
    user: null
  },

  onLaunch() {
    if (!wx.cloud) {
      wx.showToast({ title: "基础库不支持云开发", icon: "none" });
      return;
    }
    wx.cloud.init({
      env: this.globalData.envId,
      traceUser: true
    });
    this.login();
  },

  login() {
    wx.cloud.callFunction({
      name: "login",
      success: (res) => {
        this.globalData.user = res.result;
        wx.setStorageSync("user", res.result);
      },
      fail: () => {
        wx.showToast({ title: "登录失败，请重试", icon: "none" });
      }
    });
  },

  track(type, payload = {}) {
    wx.cloud.callFunction({
      name: "trackEvent",
      data: { type, payload },
      fail: () => {}
    });
  }
});
