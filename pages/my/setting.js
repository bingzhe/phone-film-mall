const CONFIG = require("../../config.js");
Page({
  data: {},
  onLoad: function (options) {
    this.setData({
      version: CONFIG.version,
    });
  },
  onShow: function () {},

  clearStorage() {
    wx.clearStorageSync();
    wx.showToast({
      title: "已清除",
      icon: "success",
    });
  },
});
