const WXAPI = require("apifm-wxapi");
const AUTH = require("../../utils/auth");
import { getAddress } from "../../api/api";

const app = getApp();
Page({
  data: {},
  
  selectTap: function (e) {
    console.log(e);
    var id = e.currentTarget.dataset.id;
    WXAPI.updateAddress({
      token: wx.getStorageSync("token"),
      id: id,
      isDefault: "true",
    }).then(function (res) {
      wx.navigateBack({});
    });
  },

  addAddess: function () {
    wx.navigateTo({
      url: "/pages/address-add/index",
    });
  },

  editAddess: function (e) {
    console.log(e);

    wx.navigateTo({
      url: "/pages/address-add/index?id=" + e.currentTarget.dataset.id,
    });
  },

  onLoad: function () {},
  onShow: function () {
    AUTH.checkHasLogined().then((isLogined) => {
      console.log("isLogined", isLogined);
      if (isLogined) {
        this.initShippingAddress();
      } else {
        AUTH.login(this);
      }
    });
  },
  async initShippingAddress() {
    const res = await getAddress({ token: wx.getStorageSync("token") });

    this.setData({
      addressList: res.data,
    });
  },
  onPullDownRefresh() {
    this.initShippingAddress();
    wx.stopPullDownRefresh();
  },
});
