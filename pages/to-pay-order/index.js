const app = getApp();
const CONFIG = require("../../config.js");
const WXAPI = require("apifm-wxapi");
const AUTH = require("../../utils/auth");
const wxpay = require("../../utils/pay.js");

import {
  getCartList,
  getUsersinfo,
  savePhone,
  getDefaultAddress,
  createOrder,
} from "../../api/api.js";
import { BASE_URL } from "../../api/config.js";

Date.prototype.format = function (format) {
  var date = {
    "M+": this.getMonth() + 1,
    "d+": this.getDate(),
    "h+": this.getHours(),
    "m+": this.getMinutes(),
    "s+": this.getSeconds(),
    "q+": Math.floor((this.getMonth() + 3) / 3),
    "S+": this.getMilliseconds(),
  };
  if (/(y+)/i.test(format)) {
    format = format.replace(
      RegExp.$1,
      (this.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
  }
  for (var k in date) {
    if (new RegExp("(" + k + ")").test(format)) {
      format = format.replace(
        RegExp.$1,
        RegExp.$1.length == 1
          ? date[k]
          : ("00" + date[k]).substr(("" + date[k]).length)
      );
    }
  }
  return format;
};

Page({
  data: {
    totalScoreToPay: 0,
    goodsList: [],
    totalPrice: 0,
    isNeedLogistics: 0, // 是否需要物流信息
    yunPrice: 0,
    allGoodsAndYunPrice: 0,
    goodsJsonStr: "",
    orderType: "", //订单类型，购物车下单或立即支付下单，默认是购物车， buyNow 说明是立即购买
    pingtuanOpenId: undefined, //拼团的话记录团号

    hasNoCoupons: true,
    coupons: [],
    couponAmount: 0, //优惠券金额
    curCoupon: null, // 当前选择使用的优惠券
    curCouponShowText: "请选择使用优惠券", // 当前选择使用的优惠券
    peisongType: "kd", // 配送方式 kd,zq 分别表示快递/到店自取
    remark: "",
    shopIndex: -1,
    pageIsEnd: false,

    bindMobileStatus: 0, // 0 未判断 1 已绑定手机号码 2 未绑定手机号码
    userScore: 0, // 用户可用积分
    deductionScore: "-1", // 本次交易抵扣的积分数， -1 为不抵扣，0 为自动抵扣，其他金额为抵扣多少积分
    shopCarType: 0, //0自营购物车，1云货架购物车
    dyopen: 0, // 是否开启订阅
    dyunit: 0, // 按天
    dyduration: 1, // 订阅间隔
    dytimes: 1, // 订阅次数
    dateStart: undefined, // 订阅首次扣费时间
    minDate: new Date().getTime(),
    maxDate: new Date(2030, 10, 1).getTime(),
    currentDate: new Date().getTime(),
    formatter: (type, value) => {
      if (type === "year") {
        return `${value}年`;
      }
      if (type === "month") {
        return `${value}月`;
      }
      if (type === "day") {
        return `${value}日`;
      }
      if (type === "hour") {
        return `${value}点`;
      }
      if (type === "minute") {
        return `${value}分`;
      }
      return value;
    },
    cardId: "0", // 使用的次卡ID
  },
  onShow() {
    if (this.data.pageIsEnd) {
      return;
    }
    AUTH.checkHasLogined().then((isLogined) => {
      if (isLogined) {
        this.doneShow();
      } else {
        AUTH.authorize().then((res) => {
          AUTH.bindSeller();
          this.doneShow();
        });
      }
    });
  },
  async doneShow() {
    //购物车下单
    const result = await getCartList({ token: wx.getStorageSync("token") });
    let totalPrice = 0;

    result.data.forEach((item) => {
      item.pic_url = `${BASE_URL}${item.goods_img}`;
      totalPrice += item.price;
    });

    this.setData({
      goodsList: result.data,
      totalPrice: totalPrice,
    });

    this.initShippingAddress();
  },

  onLoad(e) {
    const nowDate = new Date();
    let _data = {
      isNeedLogistics: 1,
      dateStart: nowDate.format("yyyy-MM-dd h:m:s"),
    };
    this.setData(_data);
    this.getUserApiInfo();
  },
  getDistrictId: function (obj, aaa) {
    if (!obj) {
      return "";
    }
    if (!aaa) {
      return "";
    }
    return aaa;
  },
  remarkChange(e) {
    this.data.remark = e.detail.value;
  },
  async goCreateOrder() {
    this.setData({
      btnLoading: true,
    });
    this.createOrder(true);
  },
  async createOrder(e) {
    // shopCarType: 0 //0自营购物车，1云货架购物车
    const loginToken = wx.getStorageSync("token"); // 用户登录 token
    const cart_list = this.data.goodsList.map((item) => item.cart_id).join(",");
    const postData = {
      token: loginToken,
      cart_list,
      order_price: this.data.totalPrice,
      pay_price: this.data.totalPrice,
    };

    if (!this.data.curAddressData) {
      wx.hideLoading();
      wx.showToast({
        title: "请设置收货地址",
        icon: "none",
      });
      this.setData({
        btnLoading: false,
      });
      return;
    }
    postData.address_id = this.data.curAddressData.address_id;

    console.log(postData);

    await createOrder(postData);

    this.setData({
      btnLoading: false,
    });

    let totalRes = {
      code: 0,
      msg: "success",
      data: {
        score: 0,
        amountReal: 0,
        orderIds: [],
      },
    };

    this.processAfterCreateOrder(totalRes);
  },
  async processAfterCreateOrder(res) {
    this.setData({
      btnLoading: false,
    });
    if (res.data.status != 0) {
      wx.redirectTo({
        url: "/pages/order-list/index",
      });
      return;
    }
    let orderId = "";
    if (res.data.orderIds && res.data.orderIds.length > 0) {
      orderId = res.data.orderIds.join();
    } else {
      orderId = res.data.id;
    }

    // wx.redirectTo({
    //   url: "/pages/order-list/index",
    // });

    // 没余额
    wxpay.wxpay(
      "order",
      res.data.amountReal,
      orderId,
      "/pages/order-list/index"
    );
  },
  async initShippingAddress() {
    const res = await getDefaultAddress({ token: wx.getStorageSync("token") });

    this.setData({
      curAddressData: res.data,
    });

    // this.processYunfei();
  },
  processYunfei() {
    var goodsList = this.data.goodsList;
    if (goodsList.length == 0) {
      return;
    }
    const goodsJsonStr = [];
    var isNeedLogistics = 0;

    let inviter_id = 0;
    let inviter_id_storge = wx.getStorageSync("referrer");
    if (inviter_id_storge) {
      inviter_id = inviter_id_storge;
    }
    for (let i = 0; i < goodsList.length; i++) {
      let carShopBean = goodsList[i];
      if (carShopBean.logistics || carShopBean.logisticsId) {
        isNeedLogistics = 1;
      }

      const _goodsJsonStr = {
        propertyChildIds: carShopBean.propertyChildIds,
      };
      if (carShopBean.sku && carShopBean.sku.length > 0) {
        let propertyChildIds = "";
        carShopBean.sku.forEach((option) => {
          propertyChildIds =
            propertyChildIds +
            "," +
            option.optionId +
            ":" +
            option.optionValueId;
        });
        _goodsJsonStr.propertyChildIds = propertyChildIds;
      }
      if (carShopBean.additions && carShopBean.additions.length > 0) {
        let goodsAdditionList = [];
        carShopBean.additions.forEach((option) => {
          goodsAdditionList.push({
            pid: option.pid,
            id: option.id,
          });
        });
        _goodsJsonStr.goodsAdditionList = goodsAdditionList;
      }
      _goodsJsonStr.goodsId = carShopBean.goodsId;
      _goodsJsonStr.number = carShopBean.number;
      _goodsJsonStr.logisticsType = 0;
      _goodsJsonStr.inviter_id = inviter_id;
      goodsJsonStr.push(_goodsJsonStr);
    }
    if (this.data.shopCarType == 1) {
      // vop 商品必须快递
      isNeedLogistics = 1;
    }
    this.setData({
      isNeedLogistics: isNeedLogistics,
      goodsJsonStr: JSON.stringify(goodsJsonStr),
    });
    this.createOrder();
  },
  addAddress: function () {
    wx.navigateTo({
      url: "/pages/address-add/index",
    });
  },
  selectAddress: function () {
    wx.navigateTo({
      url: "/pages/select-address/index",
    });
  },
  bindChangeCoupon: function (e) {
    const selIndex = e.detail.value;
    this.setData({
      curCoupon: this.data.coupons[selIndex],
      curCouponShowText: this.data.coupons[selIndex].nameExt,
    });
    this.processYunfei();
  },
  bindChangeCouponShop: function (e) {
    const selIndex = e.detail.value;
    const shopIndex = e.currentTarget.dataset.sidx;
    const shopList = this.data.shopList;
    const curshop = shopList[shopIndex];
    curshop.curCoupon = curshop.coupons[selIndex];
    curshop.curCouponShowText = curshop.coupons[selIndex].nameExt;
    shopList.splice(shopIndex, 1, curshop);
    this.setData({
      shopList,
    });
    this.processYunfei();
  },
  radioChange(e) {
    this.setData({
      peisongType: e.detail.value,
    });
    this.processYunfei();
    if (e.detail.value == "zq") {
      this.fetchShops();
    }
  },
  dyChange(e) {
    this.setData({
      dyopen: e.detail.value,
    });
  },
  dyunitChange(e) {
    this.setData({
      dyunit: e.detail.value,
    });
  },
  cancelLogin() {
    wx.navigateBack();
  },
  goMap() {
    const _this = this;
    const shop = this.data.shops[this.data.shopIndex];
    const latitude = shop.latitude;
    const longitude = shop.longitude;
    wx.openLocation({
      latitude,
      longitude,
      scale: 18,
    });
  },
  callMobile() {
    const shop = this.data.shops[this.data.shopIndex];
    wx.makePhoneCall({
      phoneNumber: shop.linkPhone,
    });
  },
  async getUserApiInfo() {
    const res = await getUsersinfo({ token: wx.getStorageSync("token") });

    this.setData({
      bindMobileStatus: res.data.phone ? 1 : 2, // 账户绑定的手机号码状态
      mobile: res.data.phone,
    });
  },
  async getPhoneNumber(e) {
    if (!e.detail.errMsg || e.detail.errMsg != "getPhoneNumber:ok") {
      wx.showToast({
        title: e.detail.errMsg,
        icon: "none",
      });
      return;
    }

    console.log(e.detail.code);
    const result = await savePhone({
      token: wx.getStorageSync("token"),
      code: e.detail.code,
    });

    wx.showToast({
      title: "读取成功",
      icon: "success",
    });

    this.setData({
      mobile: result.data,
      bindMobileStatus: 1,
    });
  },
  deductionScoreChange(event) {
    this.setData({
      deductionScore: event.detail,
    });
    this.processYunfei();
  },
  deductionScoreClick(event) {
    const { name } = event.currentTarget.dataset;
    this.setData({
      deductionScore: name,
    });
    this.processYunfei();
  },
  cardChange(event) {
    this.setData({
      cardId: event.detail,
    });
    this.processYunfei();
  },
  cardClick(event) {
    const { name } = event.currentTarget.dataset;
    this.setData({
      cardId: name,
    });
    this.processYunfei();
  },
  dateStartclick(e) {
    this.setData({
      dateStartpop: true,
    });
  },
  dateStartconfirm(e) {
    const d = new Date(e.detail);
    this.setData({
      dateStart: d.format("yyyy-MM-dd h:m:s"),
      dateStartpop: false,
    });
    console.log(e);
  },
  dateStartcancel(e) {
    this.setData({
      dateStartpop: false,
    });
  },
});
