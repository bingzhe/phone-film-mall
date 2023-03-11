const WXAPI = require("apifm-wxapi");
const AUTH = require("../../utils/auth");
const TOOLS = require("../../utils/tools.js"); // TOOLS.showTabBarBadge();

import { getGoodsList } from "../../api/api.js";
import { BASE_URL } from "../../api/config.js";

Page({
  /**
   * 页面的初始数据
   */
  data: {
    listType: 2, // 1为1个商品一行，2为2个商品一行
    name: "", // 搜索关键词
    orderBy: "", // 排序规则
    page: 1, // 读取第几页

    goods: [],
    show_seller_number: 1, // 显示销量
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      name: options.name,
      categoryId: options.categoryId,
    });
    this.search();
  },
  onShow: function () {},

  async search() {
    wx.showLoading({
      title: "加载中",
    });
    const _data = {
      order: 1,
      by: 1,
      page: this.data.page,
      size: 10,
    };

    if (this.data.orderBy == "ordersDown") {
      _data.order = 1;
    } else if (this.data.orderBy == "priceUp") {
      _data.order = 2;
    } else {
      _data.order = 0;
    }

    if (this.data.name) {
      _data.name = this.data.name;
    }
    if (this.data.categoryId) {
      _data.category_id = this.data.categoryId;
    }

    const result = await getGoodsList(_data);
    console.log(result);
    wx.hideLoading();

    if (this.data.goods.length == result.data.count && this.data.page != 1) {
      wx.showToast({
        title: "没有更多了",
        icon: "none",
      });
      return;
    }

    const goodslist = result.data.list.map((item) => {
      item.goodsUrl = "/pages/goods-details/index?id=" + item.goods_id;
      item.pic = `${BASE_URL}${item.goods_img}`;
      return item;
    });

    if (this.data.page == 1) {
      this.setData({
        goods: goodslist,
      });
    } else {
      this.setData({
        goods: this.data.goods.concat(goodslist),
      });
    }
  },
  onReachBottom() {
    this.setData({
      page: this.data.page + 1,
    });
    this.search();
  },
  changeShowType() {
    if (this.data.listType == 1) {
      this.setData({
        listType: 2,
      });
    } else {
      this.setData({
        listType: 1,
      });
    }
  },
  bindinput(e) {
    this.setData({
      name: e.detail.value,
    });
  },
  bindconfirm(e) {
    this.setData({
      page: 1,
      name: e.detail.value,
    });
    this.search();
  },
  filter(e) {
    this.setData({
      page: 1,
      orderBy: e.currentTarget.dataset.val,
    });
    this.search();
  },
  async addShopCar(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + id,
    });

    // const curGood = this.data.goods.find((ele) => {
    //   return ele.goods_id == e.currentTarget.dataset.id;
    // });

    // if (!curGood) {
    //   return;
    // }

    // this.setData({
    //   skuCurGoods: curGood,
    // });

    // if (curGood.stores <= 0) {
    //   wx.showToast({
    //     title: "已售罄~",
    //     icon: "none",
    //   });
    //   return;
    // }
    // if (!curGood.propertyIds && !curGood.hasAddition) {
    //   // 直接调用加入购物车方法
    //   const res = await WXAPI.shippingCarInfoAddItem(
    //     wx.getStorageSync("token"),
    //     curGood.id,
    //     1,
    //     []
    //   );
    //   if (res.code == 30002) {
    //     // 需要选择规格尺寸
    //     this.setData({
    //       skuCurGoods: curGood,
    //     });
    //   } else if (res.code == 0) {
    //     wx.showToast({
    //       title: "加入成功",
    //       icon: "success",
    //     });
    //     wx.showTabBar();
    //     TOOLS.showTabBarBadge(); // 获取购物车数据，显示TabBarBadge
    //   } else {
    //     wx.showToast({
    //       title: res.msg,
    //       icon: "none",
    //     });
    //   }
    // } else {
    //   // 需要选择 SKU 和 可选配件
    //   this.setData({
    //     skuCurGoods: curGood,
    //   });
    // }
  },
});
