const WXAPI = require("apifm-wxapi");
const TOOLS = require("../../utils/tools.js");
const AUTH = require("../../utils/auth");

import { getGoodsInfo } from "../../api/api.js";
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
    this.shippingCartInfo();
    this.goodsAddition();
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
  async goodsAddition() {
    const res = await WXAPI.goodsAddition(this.data.goodsId);
    if (res.code == 0) {
      this.setData({
        goodsAddition: res.data,
        hasMoreSelect: true,
      });
    }
  },
  async shippingCartInfo() {
    const number = await TOOLS.showTabBarBadge(true);
    this.setData({
      shopNum: number,
    });
  },
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

    console.log(result);

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
  async shopSubdetail(shopId) {
    const res = await WXAPI.shopSubdetail(shopId);
    if (res.code == 0) {
      this.setData({
        shopSubdetail: res.data,
      });
    }
  },
  goShopCar: function () {
    wx.reLaunch({
      url: "/pages/shop-cart/index",
    });
  },
  toAddShopCar: function () {
    this.setData({
      shopType: "addShopCar",
    });
    this.bindGuiGeTap();
  },
  tobuy: function () {
    this.setData({
      shopType: "tobuy",
    });
    this.bindGuiGeTap();
  },

  stepChange(event) {
    this.setData({
      buyNumber: event.detail,
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

    console.log({
      selectSizePrice: spec.price,
      buyNumber: spec.cart_num,
      buyNumMax: spec.stock,
    });
    
    this.setData({
      goodsDetail: this.data.goodsDetail,
      selectSizePrice: spec.price,
      buyNumber: spec.cart_num,
      buyNumMax: spec.stock,
    });
    // this.calculateGoodsPrice();
  },
  async calculateGoodsPrice() {
    // 计算最终的商品价格
    let price = this.data.goodsDetail.basicInfo.minPrice;
    let originalPrice = this.data.goodsDetail.basicInfo.originalPrice;
    let totalScoreToPay = this.data.goodsDetail.basicInfo.minScore;
    let buyNumMax = this.data.goodsDetail.basicInfo.stores;
    let buyNumber = this.data.goodsDetail.basicInfo.minBuyNumber;
    if (this.data.shopType == "toPingtuan") {
      price = this.data.goodsDetail.basicInfo.pingtuanPrice;
    }
    // 计算 sku 价格
    if (this.data.canSubmit) {
      const token = wx.getStorageSync("token");
      const res = await WXAPI.goodsPriceV2({
        token: token ? token : "",
        goodsId: this.data.goodsDetail.basicInfo.id,
        propertyChildIds: this.data.propertyChildIds,
      });
      if (res.code == 0) {
        price = res.data.price;
        if (this.data.shopType == "toPingtuan") {
          price = res.data.pingtuanPrice;
        }
        originalPrice = res.data.originalPrice;
        totalScoreToPay = res.data.score;
        buyNumMax = res.data.stores;
      }
    }
    // 计算配件价格
    if (this.data.goodsAddition) {
      this.data.goodsAddition.forEach((big) => {
        big.items.forEach((small) => {
          if (small.active) {
            price = (price * 100 + small.price * 100) / 100;
          }
        });
      });
    }
    this.setData({
      selectSizePrice: price,
      selectSizeOPrice: originalPrice,
      totalScoreToPay: totalScoreToPay,
      buyNumMax,
      buyNumber: buyNumMax >= buyNumber ? buyNumber : 0,
    });
  },
  /**
   * 选择可选配件
   */
  async labelItemTap2(e) {
    const propertyindex = e.currentTarget.dataset.propertyindex;
    const propertychildindex = e.currentTarget.dataset.propertychildindex;

    const goodsAddition = this.data.goodsAddition;
    const property = goodsAddition[propertyindex];
    const child = property.items[propertychildindex];
    if (child.active) {
      // 该操作为取消选择
      child.active = false;
      this.setData({
        goodsAddition,
      });
      this.calculateGoodsPrice();
      return;
    }
    // 单选配件取消所有子栏目选中状态
    if (property.type == 0) {
      property.items.forEach((child) => {
        child.active = false;
      });
    }
    // 设置当前选中状态
    child.active = true;
    this.setData({
      goodsAddition,
    });
    this.calculateGoodsPrice();
  },
  /**
   * 加入购物车
   */
  async addShopCar() {
    if (this.data.goodsDetail.properties && !this.data.canSubmit) {
      if (!this.data.canSubmit) {
        wx.showToast({
          title: "请选择规格",
          icon: "none",
        });
      }
      this.bindGuiGeTap();
      return;
    }
    const goodsAddition = [];
    if (this.data.goodsAddition) {
      let canSubmit = true;
      this.data.goodsAddition.forEach((ele) => {
        if (ele.required) {
          const a = ele.items.find((item) => {
            return item.active;
          });
          if (!a) {
            canSubmit = false;
          }
        }
        ele.items.forEach((item) => {
          if (item.active) {
            goodsAddition.push({
              id: item.id,
              pid: item.pid,
            });
          }
        });
      });
      if (!canSubmit) {
        wx.showToast({
          title: "请选择配件",
          icon: "none",
        });
        this.bindGuiGeTap();
        return;
      }
    }
    if (this.data.buyNumber < 1) {
      wx.showToast({
        title: "请选择购买数量",
        icon: "none",
      });
      return;
    }
    const isLogined = await AUTH.checkHasLogined();
    if (!isLogined) {
      return;
    }
    const token = wx.getStorageSync("token");
    const goodsId = this.data.goodsDetail.basicInfo.id;
    const sku = [];
    if (this.data.goodsDetail.properties) {
      this.data.goodsDetail.properties.forEach((p) => {
        sku.push({
          optionId: p.id,
          optionValueId: p.optionValueId,
        });
      });
    }
    const res = await WXAPI.shippingCarInfoAddItem(
      token,
      goodsId,
      this.data.buyNumber,
      sku,
      goodsAddition
    );
    if (res.code != 0) {
      wx.showToast({
        title: res.msg,
        icon: "none",
      });
      return;
    }

    this.closePopupTap();
    wx.showToast({
      title: "加入购物车",
      icon: "success",
    });
    this.shippingCartInfo();
  },
  /**
   * 立即购买
   */
  buyNow: function (e) {
    let that = this;
    let shoptype = e.currentTarget.dataset.shoptype;
    if (this.data.goodsDetail.properties && !this.data.canSubmit) {
      wx.showToast({
        title: "请选择规格",
        icon: "none",
      });
      this.bindGuiGeTap();
      return;
    }
    if (this.data.goodsAddition) {
      let canSubmit = true;
      this.data.goodsAddition.forEach((ele) => {
        if (ele.required) {
          const a = ele.items.find((item) => {
            return item.active;
          });
          if (!a) {
            canSubmit = false;
          }
        }
      });
      if (!canSubmit) {
        wx.showToast({
          title: "请选择配件",
          icon: "none",
        });
        this.bindGuiGeTap();
        return;
      }
    }
    if (this.data.buyNumber < 1) {
      wx.showModal({
        title: "提示",
        content: "购买数量不能为0！",
        showCancel: false,
      });
      return;
    }
    //组建立即购买信息
    var buyNowInfo = this.buliduBuyNowInfo(shoptype);
    // 写入本地存储
    wx.setStorage({
      key: "buyNowInfo",
      data: buyNowInfo,
    });
    this.closePopupTap();
    if (shoptype == "toPingtuan") {
      if (this.data.pingtuanopenid) {
        wx.navigateTo({
          url:
            "/pages/to-pay-order/index?orderType=buyNow&pingtuanOpenId=" +
            this.data.pingtuanopenid,
        });
      } else {
        WXAPI.pingtuanOpen(
          wx.getStorageSync("token"),
          that.data.goodsDetail.basicInfo.id
        ).then(function (res) {
          if (res.code == 2000) {
            return;
          }
          if (res.code != 0) {
            wx.showToast({
              title: res.msg,
              icon: "none",
              duration: 2000,
            });
            return;
          }
          wx.navigateTo({
            url:
              "/pages/to-pay-order/index?orderType=buyNow&pingtuanOpenId=" +
              res.data.id,
          });
        });
      }
    } else {
      wx.navigateTo({
        url: "/pages/to-pay-order/index?orderType=buyNow",
      });
    }
  },
  /**
   * 组建立即购买信息
   */
  buliduBuyNowInfo: function (shoptype) {
    var shopCarMap = {};
    shopCarMap.goodsId = this.data.goodsDetail.basicInfo.id;
    shopCarMap.shopId = this.data.goodsDetail.basicInfo.shopId;
    shopCarMap.pic = this.data.goodsDetail.basicInfo.pic;
    shopCarMap.name = this.data.goodsDetail.basicInfo.name;
    // shopCarMap.label=this.data.goodsDetail.basicInfo.id; 规格尺寸
    shopCarMap.propertyChildIds = this.data.propertyChildIds;
    shopCarMap.label = this.data.propertyChildNames;
    shopCarMap.price = this.data.selectSizePrice;
    // if (shoptype == 'toPingtuan') { // 20190714 拼团价格注释掉
    //   shopCarMap.price = this.data.goodsDetail.basicInfo.pingtuanPrice;
    // }
    shopCarMap.score = this.data.totalScoreToPay;
    shopCarMap.left = "";
    shopCarMap.active = true;
    shopCarMap.number = this.data.buyNumber;
    shopCarMap.logisticsType = this.data.goodsDetail.basicInfo.logisticsId;
    shopCarMap.logistics = this.data.goodsDetail.logistics;
    shopCarMap.weight = this.data.goodsDetail.basicInfo.weight;

    if (this.data.goodsAddition && this.data.goodsAddition.length > 0) {
      const additions = [];
      this.data.goodsAddition.forEach((ele) => {
        ele.items.forEach((item) => {
          if (item.active) {
            additions.push({
              id: item.id,
              name: item.name,
              pid: ele.id,
              pname: ele.name,
            });
          }
        });
      });
      if (additions.length > 0) {
        shopCarMap.additions = additions;
      }
    }

    var buyNowInfo = {};
    buyNowInfo.shopNum = 0;
    buyNowInfo.shopList = [];

    buyNowInfo.shopList.push(shopCarMap);
    buyNowInfo.kjId = this.data.kjId;
    if (this.data.shopSubdetail) {
      buyNowInfo.shopInfo = this.data.shopSubdetail.info;
    } else {
      buyNowInfo.shopInfo = {
        id: 0,
        name: "其他",
        pic: null,
        serviceDistance: 99999999,
      };
    }

    return buyNowInfo;
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
