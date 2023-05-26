import { registerGetOpenid } from "../../utils/auth";
import { phoneLoginApi } from "../../api/api";

Page({
  /**
   * 页面的初始数据
   */
  data: {
    openid: "",
    username: "",
    password: "",
    checked: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getRegisterOpenid();
  },

  onShow: function () {},

  async getRegisterOpenid() {
    const openid = await registerGetOpenid();

    this.setData({
      openid,
    });
  },

  bindUsernameInput: function (e) {
    this.setData({
      username: e.detail.value,
    });
  },
  bindPasswordInput: function (e) {
    this.setData({
      password: e.detail.value,
    });
  },

  onCheckChange(event) {
    this.setData({
      checked: event.detail,
    });
  },

  async loginUser() {
    if (!this.data.checked) {
      wx.showToast({
        title: "请同意用户协议和隐私协议在登录",
        icon: "none",
        duration: 1500,
      });
      return;
    }

    if (!this.data.username) {
      wx.showToast({
        title: "请输入手机号",
        icon: "none",
        duration: 1500,
      });
      return;
    }

    if (!this.data.password) {
      wx.showToast({
        title: "请输入密码",
        icon: "none",
        duration: 1500,
      });
      return;
    }

    const params = {
      username: this.data.username,
      password: this.data.password,
      weapp_openid: this.data.openid,
    };

    await phoneLoginApi(params);

    wx.showToast({
      title: "登录成功",
      icon: "none",
      duration: 1500,
    });

    setTimeout(() => {
      wx.navigateTo({
        url: "/pages/category/category",
      });
    }, 1500);
  },

  _goBack: function () {
    wx.navigateBack({
      delta: 1,
    });
  },
  gotoPrivacy() {
    wx.navigateTo({
      url: "/pages/ysxy/ysxy",
    });
  },
  gotoUser() {
    wx.navigateTo({
      url: "/pages/yhxy/yhxy",
    });
  },
  goRegister() {
    wx.switchTab({
      url: "/pages/register/register",
    });
  },
});
