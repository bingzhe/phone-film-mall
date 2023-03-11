const WXAPI = require("apifm-wxapi");
const TOOLS = require("../../utils/tools.js");
const AUTH = require("../../utils/auth");

import { getCateList, getGoodsIndex, getBanner } from "../../api/api.js";
import { BASE_URL } from "../../api/config.js";

const APP = getApp();

Page({
  data: {
    mallName: "贴膜商城",
    inputVal: "", // 搜索框内容
    goodsRecommend: [], // 推荐商品
    loadingHidden: false, // loading
    selectCurrent: 0,
    categories: [],
    goods: [],
    loadingMoreHidden: true,
    curPage: 1,
    pageSize: 20,
  },
  tabClick(e) {
    // 商品分类点击
    const category = this.data.categories.find((ele) => {
      return ele.category_id == e.currentTarget.dataset.id;
    });
    wx.setStorageSync("_categoryId", category.category_id);
    wx.switchTab({
      url: "/pages/category/category",
    });
  },

  toDetailsTap: function (e) {
    console.log(e);
    const id = e.currentTarget.dataset.id;
    const supplytype = e.currentTarget.dataset.supplytype;
    const yyId = e.currentTarget.dataset.yyid;
    if (supplytype == "cps_jd") {
      wx.navigateTo({
        url: `/packageCps/pages/goods-details/cps-jd?id=${id}`,
      });
    } else if (supplytype == "vop_jd") {
      wx.navigateTo({
        url: `/pages/goods-details/vop?id=${yyId}&goodsId=${id}`,
      });
    } else if (supplytype == "cps_pdd") {
      wx.navigateTo({
        url: `/packageCps/pages/goods-details/cps-pdd?id=${id}`,
      });
    } else if (supplytype == "cps_taobao") {
      wx.navigateTo({
        url: `/packageCps/pages/goods-details/cps-taobao?id=${id}`,
      });
    } else {
      wx.navigateTo({
        url: `/pages/goods-details/index?id=${id}`,
      });
    }
  },
  tapBanner: function (e) {
    const url = e.currentTarget.dataset.url;
    if (url) {
      wx.navigateTo({
        url,
      });
    }
  },
  adClick: function (e) {
    const url = e.currentTarget.dataset.url;
    if (url) {
      wx.navigateTo({
        url,
      });
    }
  },
  bindTypeTap: function (e) {
    this.setData({
      selectCurrent: e.index,
    });
  },
  onLoad: function (e) {
    wx.showShareMenu({
      withShareTicket: true,
    });
    const that = this;
    // // 读取分享链接中的邀请人编号
    // if (e && e.inviter_id) {
    //   wx.setStorageSync("referrer", e.inviter_id);
    // }
    // // 读取小程序码中的邀请人编号
    // if (e && e.scene) {
    //   const scene = decodeURIComponent(e.scene);
    //   if (scene) {
    //     wx.setStorageSync("referrer", scene.substring(11));
    //   }
    // }
    // 静默式授权注册/登陆
    AUTH.checkHasLogined().then((isLogined) => {
      if (!isLogined) {
        AUTH.authorize().then((aaa) => {
          AUTH.bindSeller();
          TOOLS.showTabBarBadge();
        });
      } else {
        AUTH.bindSeller();
        TOOLS.showTabBarBadge();
      }
    });
    this.initBanners();
    this.categories();
    this.getGoodsRecommend();

    that.getNotice();
    // 读取系统参数
    this.readConfigVal();
    getApp().configLoadOK = () => {
      this.readConfigVal();
    };
  },
  readConfigVal() {
    wx.setNavigationBarTitle({
      title: this.data.mallName,
    });
    this.setData({
      // mallName: wx.getStorageSync("mallName")
      //   ? wx.getStorageSync("mallName")
      //   : "",
      // show_buy_dynamic: wx.getStorageSync("show_buy_dynamic"),
    });
    // const shopMod = 0; // 0为单店铺版本 ； 1为多店铺版本
    // const shopInfo = wx.getStorageSync("shopInfo");
    // if (shopMod == "1" && !shopInfo) {
    //   wx.redirectTo({
    //     url: "/pages/shop/select",
    //   });
    // }
  },

  async initBanners() {
    const result = await getBanner();
    console.log(result);

    const bannerList = result.data.map((item) => {
      item.img_url_full = `${BASE_URL}${item.img_url}`;
      return item;
    });

    if (bannerList.length == 0) {
      wx.showModal({
        title: "提示",
        content: "请在后台添加 banner 轮播图片，自定义类型填写 index",
        showCancel: false,
      });
      return;
    }

    this.setData({
      banners: bannerList,
    });
  },
  onShow: function (e) {
    this.setData({
      navHeight: APP.globalData.navHeight,
      navTop: APP.globalData.navTop,
      windowHeight: APP.globalData.windowHeight,
      menuButtonObject: APP.globalData.menuButtonObject, //小程序胶囊信息
    });
    this.setData({
      shopInfo: wx.getStorageSync("shopInfo"),
    });
    // 获取购物车数据，显示TabBarBadge
    TOOLS.showTabBarBadge();
    const refreshIndex = wx.getStorageSync("refreshIndex");
    if (refreshIndex) {
      this.onPullDownRefresh();
      wx.removeStorageSync("refreshIndex");
    }
  },

  async categories() {
    const result = await getCateList();
    const categories = result.data.map((item) => {
      item.icon = `${BASE_URL}${item.icon_url}`;

      return item;
    });
    this.setData({
      categories: categories,
    });
  },
  async getGoodsRecommend() {
    const result = await getGoodsIndex();

    const goodsList = result.data.map((item) => {
      item.goods_img_url = `${BASE_URL}${item.goods_img}`;
      return item;
    });

    this.setData({
      goodsRecommend: goodsList,
    });
  },
  onShareAppMessage: function () {
    return {
      title:
        '"' +
        wx.getStorageSync("mallName") +
        '" ' +
        wx.getStorageSync("share_profile"),
      path: "/pages/index/index?inviter_id=" + wx.getStorageSync("uid"),
    };
  },
  getNotice: function () {
    var that = this;
    WXAPI.noticeList({ pageSize: 5 }).then(function (res) {
      if (res.code == 0) {
        that.setData({
          noticeList: res.data,
        });
      }
    });
  },
  // onReachBottom: function () {},
  // onPullDownRefresh: function () {
  //   wx.stopPullDownRefresh();
  // },

  goSearch() {
    wx.navigateTo({
      url: "/pages/search/index",
    });
  },
  goNotice(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "/pages/notice/show?id=" + id,
    });
  },
});
