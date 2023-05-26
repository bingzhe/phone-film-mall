const WXAPI = require("apifm-wxapi");
const TOOLS = require("../../utils/tools.js");
const AUTH = require("../../utils/auth");

const app = getApp();
import { getCartList, delCart, createCart } from "../../api/api.js";
import { BASE_URL } from "../../api/config.js";

Page({
  data: {
    shopCarType: 0, //0自营 1云货架
    saveHidden: true,
    allSelect: true,
    delBtnWidth: 120, //删除按钮宽度单位（rpx）

    goodsList: [],
    totalPrice: 0,
  },

  //获取元素自适应后的实际宽度
  getEleWidth: function (w) {
    var real = 0;
    try {
      var res = wx.getSystemInfoSync().windowWidth;
      var scale = 750 / 2 / (w / 2);
      // console.log(scale);
      real = Math.floor(res / scale);
      return real;
    } catch (e) {
      return false;
      // Do something when catch error
    }
  },
  initEleWidth: function () {
    var delBtnWidth = this.getEleWidth(this.data.delBtnWidth);
    this.setData({
      delBtnWidth: delBtnWidth,
    });
  },
  onLoad: function () {
    this.initEleWidth();
    this.onShow();
  },
  onShow: function () {
    if (typeof this.getTabBar === "function" && this.getTabBar()) {
      this.getTabBar().setMallTab(2);
    }

    this.shippingCarInfo();
  },
  async shippingCarInfo() {
    const result = await getCartList({ token: wx.getStorageSync("token") });

    let totalPrice = 0;

    result.data.forEach((item) => {
      item.pic_url = `${BASE_URL}${item.goods_img}`;
      // item.active = true;
      item.selected = true;
      const select = this.data.goodsList.find(
        (goods) => goods.cart_id == item.cart_id
      );

      item.selected = select ? select.selected : true;

      if (item.selected) {
        totalPrice += item.price;
      }
    });

    this.setData({
      goodsList: result.data,
      totalPrice: totalPrice,
    });
  },
  toIndexPage: function () {
    wx.switchTab({
      url: "/pages/index/index",
    });
  },

  touchS: function (e) {
    if (e.touches.length == 1) {
      this.setData({
        startX: e.touches[0].clientX,
      });
    }
  },
  touchM: function (e) {
    const index = e.currentTarget.dataset.index;
    if (e.touches.length == 1) {
      var moveX = e.touches[0].clientX;
      var disX = this.data.startX - moveX;
      var delBtnWidth = this.data.delBtnWidth;
      var left = "";
      if (disX == 0 || disX < 0) {
        //如果移动距离小于等于0，container位置不变
        left = "margin-left:0px";
      } else if (disX > 0) {
        //移动距离大于0，container left值等于手指移动距离
        left = "margin-left:-" + disX + "px";
        if (disX >= delBtnWidth) {
          left = "left:-" + delBtnWidth + "px";
        }
      }
      this.data.goodsList[index].left = left;
      this.setData({
        goodsList: this.data.goodsList,
      });
    }
  },

  touchE: function (e) {
    var index = e.currentTarget.dataset.index;
    if (e.changedTouches.length == 1) {
      var endX = e.changedTouches[0].clientX;
      var disX = this.data.startX - endX;
      var delBtnWidth = this.data.delBtnWidth;
      //如果距离小于删除按钮的1/2，不显示删除按钮
      var left =
        disX > delBtnWidth / 2
          ? "margin-left:-" + delBtnWidth + "px"
          : "margin-left:0px";
      this.data.goodsList[index].left = left;
      this.setData({
        goodsList: this.data.goodsList,
      });
    }
  },
  async delItem(e) {
    const cart_id = e.currentTarget.dataset.key;
    this.delItemDone(cart_id);
  },
  async delItemDone(ids) {
    const token = wx.getStorageSync("token");

    await delCart({
      token,
      cart_list: ids,
    });

    this.shippingCarInfo();
  },
  onBatchDel() {
    const selectCartIds = this.data.goodsList
      .filter((item) => item.selected)
      .map((item) => item.cart_id)
      .join(",");

    if (!selectCartIds) {
      wx.showToast({
        title: "请选择要删除的商品",
        icon: "none",
      });
      return;
    }
    const that = this;

    // 弹出删除确认
    wx.showModal({
      content: "确定要删除商品吗？",
      success: (res) => {
        if (res.confirm) {
          that.delItemDone(selectCartIds);
        }
      },
    });
  },
  async jiaBtnTap(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.goodsList[index];
    const number = item.goods_num + 1;
    const token = wx.getStorageSync("token");

    await createCart({
      token,
      spec_id: item.spec_id,
      goods_num: number,
      cart_id: item.cart_id,
    });

    this.shippingCarInfo();
  },
  async jianBtnTap(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.goodsList[index];
    const number = item.goods_num - 1;
    const that = this;
    if (number <= 0) {
      // 弹出删除确认
      wx.showModal({
        content: "确定要删除该商品吗？",
        success: (res) => {
          if (res.confirm) {
            that.delItemDone(item.cart_id);
          }
        },
      });
      return;
    }
    const token = wx.getStorageSync("token");

    await createCart({
      token,
      spec_id: item.spec_id,
      goods_num: number,
      cart_id: item.cart_id,
    });

    this.shippingCarInfo();
  },
  async changeCarNumber(e) {
    const cart_id = e.currentTarget.dataset.key;
    const spec_id = e.currentTarget.dataset.spec;
    const number = e.detail.value;
    const token = wx.getStorageSync("token");

    await createCart({
      token,
      spec_id,
      goods_num: number,
      cart_id,
    });

    this.shippingCarInfo();
  },
  async radioClick(e) {
    var index = e.currentTarget.dataset.index;
    var item = this.data.goodsList[index];

    item.selected = !item.selected;

    const allSelect = this.data.goodsList.some((item) => item.selected);

    let totalPrice = 0;

    this.data.goodsList.forEach((item) => {
      if (item.selected) {
        totalPrice += item.price;
      }
    });

    this.setData({
      goodsList: this.data.goodsList,
      allSelect,
      totalPrice: totalPrice,
    });
  },
  async radioAllClick() {
    const checked = !this.data.allSelect;
    let totalPrice = 0;

    this.data.goodsList.forEach((item) => {
      item.selected = checked;
      if (item.selected) {
        totalPrice += item.price;
      }
    });
    this.setData({
      allSelect: checked,
      totalPrice: totalPrice,
      goodsList: this.data.goodsList,
    });
  },
  onChange(event) {
    this.setData({
      shopCarType: event.detail.name,
    });
    this.shippingCarInfo();
  },
  handleToPay() {
    const selectCartIds = this.data.goodsList
      .filter((item) => item.selected)
      .map((item) => item.cart_id)
      .join(",");

    if (!selectCartIds) {
      wx.showToast({
        title: "请选择要结算的商品",
        icon: "none",
      });
      return;
    }

    wx.redirectTo({
      url: "/pages/to-pay-order/index?selectCartIds=" + selectCartIds,
    });
  },
});
