import { getUsersinfo, saveUsername, fileCommonUpload } from "../../api/api.js";
import { BASE_URL } from "../../api/config.js";

Page({
  data: {
    balance: 0.0,
    freeze: 0,
    score: 0,
    growth: 0,
    score_sign_continuous: 0,
    rechargeOpen: false, // 是否开启充值[预存]功能

    // 用户订单统计数据
    count_id_no_confirm: 0,
    count_id_no_pay: 0,
    count_id_no_reputation: 0,
    count_id_no_transfer: 0,
    nick: undefined,
    avatarUrl: "",
  },
  onLoad() {},
  onShow() {
    if (typeof this.getTabBar === "function" && this.getTabBar()) {
      this.getTabBar().setMallTab(3);
    }

    this.getUserApiInfo();
  },
  async getUserApiInfo() {
    const res = await getUsersinfo({ token: wx.getStorageSync("token") });

    let avatarUrl = "";

    if (res.data.avatar) {
      avatarUrl = `${BASE_URL}${res.data.avatar}`;
    }

    this.setData({
      // mobile: res.data.phone,
      nick: res.data.nikename,
      avatarUrl,
    });
  },
  goOrder: function (e) {
    wx.navigateTo({
      url: "/pages/order-list/index?type=" + e.currentTarget.dataset.type,
    });
  },
  scanOrderCode() {
    wx.scanCode({
      onlyFromCamera: true,
      success(res) {
        wx.navigateTo({
          url: "/pages/order-details/scan-result?hxNumber=" + res.result,
        });
      },
      fail(err) {
        console.error(err);
        wx.showToast({
          title: err.errMsg,
          icon: "none",
        });
      },
    });
  },
  gogrowth() {
    wx.navigateTo({
      url: "/pages/score/growth",
    });
  },
  editNick() {
    this.setData({
      nickShow: true,
    });
  },
  async _editNick() {
    if (!this.data.nick) {
      wx.showToast({
        title: "请填写昵称",
        icon: "none",
      });
      return;
    }
    const postData = {
      token: wx.getStorageSync("token"),
      nikename: this.data.nick,
    };

    await saveUsername(postData);
    wx.showToast({
      title: "设置成功",
    });

    this.getUserApiInfo();
  },
  async onChooseAvatar(e) {
    const avatarUrl = e.detail.avatarUrl;
    const result = await fileCommonUpload(avatarUrl);

    console.log("图片上传", result);

    await saveUsername({
      token: wx.getStorageSync("token"),
      avatar: result.data,
    });

    wx.showToast({
      title: "设置成功",
    });
    this.getUserApiInfo();
  },
  goUserCode() {
    wx.navigateTo({
      url: "/pages/my/user-code",
    });
  },
});
