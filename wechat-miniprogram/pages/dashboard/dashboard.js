const app = getApp();

Page({
  data: {
    metrics: {
      dau7: 0,
      todayEvents: 0,
      wordComplete: 0
    },
    events: []
  },

  onShow() {
    app.track("page_view", { page: "dashboard" });
    wx.cloud.callFunction({
      name: "getDashboard",
      success: (res) => {
        this.setData(res.result);
      },
      fail: () => {
        wx.showToast({ title: "数据加载失败", icon: "none" });
      }
    });
  }
});
