// pages/performance-list/performance-list.js
import { getUsersListApi, getPerformanceListApi } from "../../api/api";
import { BASE_URL } from "../../api/config.js";
import dayjs from "dayjs";

Page({
  /**
   * 页面的初始数据
   */
  data: {
    performanceList: [],
    userlist: [],

    type: 1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.type) {
      this.setData({
        type: options.type,
      });

      console.log(options);
      if (options.type == 1) {
        this.getUsersList();
      } else {
        this.getPerformanceList();
      }
    }

    // this.getPerformanceList();
    // this.getUsersList();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

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

  async getUsersList() {
    const postData = {
      token: wx.getStorageSync("token"),
    };

    const result = await getUsersListApi(postData);

    const list = result.data.map((item) => {
      if (item.avatar) {
        item.avatar = `${BASE_URL}${item.avatar}`;
      }
      item.time = dayjs.unix(item.reg_time).format("YYYY-MM-DD HH:mm:ss");

      return item;
    });

    this.setData({
      userlist: list,
    });
  },

  async getPerformanceList() {
    const postData = {
      token: wx.getStorageSync("token"),
    };

    console.log(this.data.type);
    if (this.data.type == 3) {
      postData.type = 1;
    }
    const result = await getPerformanceListApi(postData);

    const list = result.data.map((item) => {
      item.time = dayjs.unix(item.ctime).format("YYYY-MM-DD HH:mm:ss");

      return item;
    });

    this.setData({
      performanceList: list,
    });
  },
});
