import { rootUrl, getVideoListApi } from "../../api/filmApi";

const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    videoList: [],
    rootUrl,
    isIphoneX: app.globalData.isIphoneX,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getVideoList();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.hideTabBar({
      fail: function () {
        setTimeout(function () {
          wx.hideTabBar();
        }, 500);
      },
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    wx.hideTabBar({
      fail: function () {
        setTimeout(function () {
          wx.hideTabBar();
        }, 500);
      },
    });

    if (typeof this.getTabBar === "function" && this.getTabBar()) {
      this.getTabBar().setSearchTab(1);
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},

  async getVideoList() {
    const result = await getVideoListApi();
    if (result.code !== 200) return;

    const list = result.data.map((item) => {
      item.fullUrl = `${rootUrl}${item.video_url}`;
      return item;
    });

    this.setData({
      videoList: list,
    });
  },
});
