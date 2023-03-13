// const WXAPI = require("apifm-wxapi");
const AUTH = require("../../utils/auth");
import { getAddress, saveAddress } from "../../api/api";

const app = getApp();
Page({
  data: {},

  selectTap: function (e) {
    console.log(e);
    const id = e.currentTarget.dataset.id;
    const selectAddress = this.data.addressList.find(
      (item) => item.address_id == id
    );

    const postData = {
      token: wx.getStorageSync("token"),
      name: selectAddress.name,
      address: selectAddress.address,
      telephone: selectAddress.telephone,
      province_name: selectAddress.province_name,
      province_id: selectAddress.province_id,
      city_name: selectAddress.city_name,
      city_id: selectAddress.city_id,
      area_name: selectAddress.area_name,
      area_id: selectAddress.area_id,
      address_id: id,
      is_default: 1,
    };

    /**
     * 修改默认地址
     */
    saveAddress(postData).then((res) => {
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

    AUTH.login();
    this.initShippingAddress();

    // AUTH.checkHasLogined().then((isLogined) => {
    //   console.log("isLogined", isLogined);
    //   if (isLogined) {
    //   } else {
    //     AUTH.login(this);
    //   }
    // });
  },
  async initShippingAddress() {
    const res = await getAddress({ token: wx.getStorageSync("token") });

    const addressList = res.data.map((item) => {
      item.addressInfo = `${item.province_name}${item.city_name}${item.area_name}${item.address}`;
      return item;
    });

    this.setData({
      addressList: addressList,
    });
  },
  onPullDownRefresh() {
    this.initShippingAddress();
    wx.stopPullDownRefresh();
  },
});
