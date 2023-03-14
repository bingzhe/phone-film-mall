const WXAPI = require("apifm-wxapi");
const TOOLS = require("../../utils/tools.js");
const AUTH = require("../../utils/auth");

import { getGoodsInfo, createCartBatch } from "../../api/api.js";
import { BASE_URL } from "../../api/config.js";

Page({
  data: {
    createTabs: false, //绘制tabs
    goodsDetail: {},
    hasMoreSelect: true,
    selectSizePrice: 0,
    selectSizeOPrice: 0,
    totalScoreToPay: 0,
    shopNum: 0,
    hideShopPopup: true,
    buyNumber: 0,
    buyNumMin: 0,
    buyNumMax: 0,
    propertyChildIds: "",
    propertyChildNames: "",
    canSubmit: false, //  选中规格尺寸时候是否允许加入购物车
    shopType: "addShopCar", //购物类型，加入购物车或立即购买，默认为加入购物车

    specSelectIndex: 0, // 规格选中的index
  },
  bindscroll(e) {
    if (this.data.tabclicked) {
      return;
    }
    //计算页面 轮播图、详情、评价(砍价)view 高度
    this.getTopHeightFunction();
    var tabsHeight = this.data.tabsHeight; //顶部距离（tabs高度）
    if (
      this.data.tabs[0].topHeight - tabsHeight <= 0 &&
      0 < this.data.tabs[1].topHeight - tabsHeight
    ) {
      //临界值，根据自己的需求来调整
      this.setData({
        active: this.data.tabs[0].tabs_name, //设置当前标签栏
      });
    } else if (this.data.tabs.length == 2) {
      this.setData({
        active: this.data.tabs[1].tabs_name,
      });
    } else if (
      this.data.tabs[1].topHeight - tabsHeight <= 0 &&
      0 < this.data.tabs[2].topHeight - tabsHeight
    ) {
      this.setData({
        active: this.data.tabs[1].tabs_name,
      });
    } else if (this.data.tabs[2].topHeight - tabsHeight <= 0) {
      this.setData({
        active: this.data.tabs[2].tabs_name,
      });
    }
  },
  onLoad(e) {
    // e.id = 122843
    // 读取分享链接中的邀请人编号
    if (e && e.inviter_id) {
      wx.setStorageSync("referrer", e.inviter_id);
    }
    // 读取小程序码中的邀请人编号
    if (e && e.scene) {
      const scene = decodeURIComponent(e.scene); // 处理扫码进商品详情页面的逻辑
      if (scene && scene.split(",").length >= 2) {
        e.id = scene.split(",")[0];
        wx.setStorageSync("referrer", scene.split(",")[1]);
      }
    }
    // 静默式授权注册/登陆
    AUTH.checkHasLogined().then((isLogined) => {
      if (!isLogined) {
        AUTH.authorize().then((aaa) => {
          AUTH.bindSeller();
        });
      } else {
        AUTH.bindSeller();
      }
    });
    this.data.goodsId = e.id;
    let goodsDetailSkuShowType = 1; // TODO 0,1
    if (!goodsDetailSkuShowType) {
      goodsDetailSkuShowType = 0;
    }
    // 补偿写法
    getApp().configLoadOK = () => {
      this.readConfigVal();
    };
    this.setData({
      goodsDetailSkuShowType,
      curuid: wx.getStorageSync("uid"),
    });
    this.readConfigVal();
    this.getGoodsDetail(this.data.goodsId);
    // this.shippingCartInfo();
    // this.goodsAddition();
  },
  readConfigVal() {
    // 读取系统参数
    let tabs = [
      {
        tabs_name: "商品简介",
        view_id: "swiper-container",
        topHeight: 0,
      },
      {
        tabs_name: "商品详情",
        view_id: "goods-des-info",
        topHeight: 0,
      },
    ];

    this.setData({
      tabs,
    });
  },
  // async goodsAddition() {
  //   const res = await WXAPI.goodsAddition(this.data.goodsId);
  //   if (res.code == 0) {
  //     this.setData({
  //       goodsAddition: res.data,
  //       hasMoreSelect: true,
  //     });
  //   }
  // },
  // async shippingCartInfo() {
  //   const number = await TOOLS.showTabBarBadge(true);
  //   this.setData({
  //     shopNum: number,
  //   });
  // },
  onShow() {
    this.setData({
      createTabs: true, //绘制tabs
    });
    //计算tabs高度
    var query = wx.createSelectorQuery();
    query
      .select("#tabs")
      .boundingClientRect((rect) => {
        var tabsHeight = rect.height;
        this.setData({
          tabsHeight: tabsHeight,
        });
      })
      .exec();

    AUTH.checkHasLogined().then((isLogined) => {
      if (isLogined) {
        // this.goodsFavCheck();
      }
    });
  },
  getTopHeightFunction() {
    var that = this;
    var tabs = that.data.tabs;
    tabs.forEach((element, index) => {
      var viewId = "#" + element.view_id;
      that.getTopHeight(viewId, index);
    });
  },
  getTopHeight(viewId, index) {
    var query = wx.createSelectorQuery();
    query
      .select(viewId)
      .boundingClientRect((rect) => {
        if (!rect) {
          return;
        }
        let top = rect.top;
        var tabs = this.data.tabs;
        tabs[index].topHeight = top;
        this.setData({
          tabs: tabs,
        });
      })
      .exec();
  },

  async getGoodsDetail(goodsId) {
    const result = await getGoodsInfo({
      goods_id: goodsId,
      token: wx.getStorageSync("token"),
    });
    const gooodsInfo = result.data || {};

    let selectSizePrice = 0;
    let buyNumber = 0;
    let buyNumMax = 0;

    gooodsInfo.pics = gooodsInfo.img_list.map((item) => {
      return `${BASE_URL}${item}`;
    });

    gooodsInfo.spec_list.forEach((item, i) => {
      if (i == 0) {
        item.active = true;
        selectSizePrice = item.price;
        buyNumber = item.cart_num;
        buyNumMax = item.stock;
      } else {
        item.active = false;
      }
    });

    this.setData({
      goodsDetail: gooodsInfo,
      selectSizePrice: selectSizePrice,
      buyNumber,
      buyNumMax,
    });

    // if (goodsDetailRes.code == 0) {
    //   if (!goodsDetailRes.data.pics || goodsDetailRes.data.pics.length == 0) {
    //     goodsDetailRes.data.pics = [
    //       {
    //         pic: goodsDetailRes.data.basicInfo.pic,
    //       },
    //     ];
    //   }
    //   if (goodsDetailRes.data.properties) {
    //     that.setData({
    //       hasMoreSelect: true,
    //       selectSizePrice: goodsDetailRes.data.basicInfo.minPrice,
    //       selectSizeOPrice: goodsDetailRes.data.basicInfo.originalPrice,
    //       totalScoreToPay: goodsDetailRes.data.basicInfo.minScore,
    //     });
    //   }
    //   if (goodsDetailRes.data.basicInfo.shopId) {
    //     this.shopSubdetail(goodsDetailRes.data.basicInfo.shopId);
    //   }
    //   that.data.goodsDetail = goodsDetailRes.data;
    //   let _data = {
    //     goodsDetail: goodsDetailRes.data,
    //     selectSizePrice: goodsDetailRes.data.basicInfo.minPrice,
    //     selectSizeOPrice: goodsDetailRes.data.basicInfo.originalPrice,
    //     totalScoreToPay: goodsDetailRes.data.basicInfo.minScore,
    //     buyNumMax: goodsDetailRes.data.basicInfo.stores,
    //     buyNumber: goodsDetailRes.data.basicInfo.stores > 0 ? 1 : 0,
    //   };
    //   that.setData(_data);
    // }
  },
  // async shopSubdetail(shopId) {
  //   const res = await WXAPI.shopSubdetail(shopId);
  //   if (res.code == 0) {
  //     this.setData({
  //       shopSubdetail: res.data,
  //     });
  //   }
  // },
  goShopCar: function () {
    wx.reLaunch({
      url: "/pages/shop-cart/index",
    });
  },
  stepChange(event) {
    //更新spec_list
    this.data.goodsDetail.spec_list[this.data.specSelectIndex].cart_num =
      event.detail;

    this.setData({
      buyNumber: event.detail,
      goodsDetail: this.data.goodsDetail,
    });
  },
  // 判断当前商品是否支持某个sku的属性
  checkHasSkuItems(sk) {
    this.data.goodsDetail.skuList.filter((ele) => {
      const a = this.data.goodsDetail.properties.filter((ele) => {
        return ele.optionValueId;
      });
      console.log(a);
      for (let index = 0; index < array.length; index++) {
        const element = array[index];
      }
    });
  },
  /**
   * 选择商品规格
   */
  async labelItemTap(e) {
    // const propertyindex = e.currentTarget.dataset.propertyindex;
    const propertychildindex = e.currentTarget.dataset.propertychildindex;

    // const property = this.data.goodsDetail.properties[propertyindex];
    // const child = property.childsCurGoods[propertychildindex];
    // const _childActive = child.active;

    // 取消该分类下的子栏目所有的选中状态
    this.data.goodsDetail.spec_list.forEach((item) => {
      item.active = false;
    });
    // 设置当前选中状态，或者取消选中
    this.data.goodsDetail.spec_list[propertychildindex].active = true;

    const spec = this.data.goodsDetail.spec_list[propertychildindex];

    this.setData({
      goodsDetail: this.data.goodsDetail,
      selectSizePrice: spec.price,
      specSelectIndex: propertychildindex,
      buyNumber: spec.cart_num,
      buyNumMax: spec.stock,
    });
  },

  /**
   * 加入购物车
   */
  async addShopCar() {
    const cart_list = [];

    this.data.goodsDetail.spec_list.forEach((item) => {
      if (item.cart_num > 0) {
        cart_list.push({
          goods_num: item.cart_num,
          spec_id: item.spec_id,
        });
      }
    });

    if (cart_list.length == 0) {
      wx.showToast({
        title: "请选择商品",
        icon: "none",
      });

      return;
    }

    const params = {
      token: wx.getStorageSync("token"),
      cart_list: JSON.stringify(cart_list),
    };

    const result = await createCartBatch(params);

    wx.showToast({
      title: "加入购物车",
      icon: "success",
    });

    setTimeout(() => {
      wx.switchTab({
        url: "/pages/shop-cart/index",
      });
    }, 1500);

    // this.shippingCartInfo();
  },

  goIndex() {
    wx.switchTab({
      url: "/pages/index/index",
    });
  },

  previewImage(e) {
    const url = e.currentTarget.dataset.url;
    wx.previewImage({
      current: url, // 当前显示图片的http链接
      urls: [url], // 需要预览的图片http链接列表
    });
  },
  previewImage2(e) {
    const url = e.currentTarget.dataset.url;
    const urls = [];
    this.data.goodsDetail.pics.forEach((ele) => {
      urls.push(ele);
    });
    wx.previewImage({
      current: url, // 当前显示图片的http链接
      urls, // 需要预览的图片http链接列表
    });
  },
  onTabsChange(e) {
    var index = e.detail.index;
    this.setData({
      toView: this.data.tabs[index].view_id,
      tabclicked: true,
    });
    setTimeout(() => {
      this.setData({
        tabclicked: false,
      });
    }, 1000);
  },
  backToHome() {
    wx.switchTab({
      url: "/pages/index/index",
    });
  },
});
