import { getCateList, getGoodsList } from "../../api/api.js";
import { BASE_URL } from "../../api/config.js";
import { checkLogined } from "../../utils/auth.js";
import { getGoodsInfo, createCartBatch } from "../../api/api.js";

Page({
  /**
   * 页面的初始数据
   */
  data: {
    categoryMod: 2,

    firstCategories: [],
    activeCategory: 0,
    categorySelected: {
      // cate_name: "",
      // category_id: "",
    },
    secondCategories: [],
    secondCategorySelected: {},

    page: 1, // 商品第几页
    goods: [],

    onLoadStatus: true,
    scrolltop: 0,

    skuCurGoods: undefined,
    pageSize: 20,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showShareMenu({
      withShareTicket: true,
    });
    // this.setData({
    //   categoryMod: wx.getStorageSync("categoryMod"),
    // });

    // checkLogined();
    this.getCategory();
  },
  onShow() {
    // checkLogined();

    if (typeof this.getTabBar === "function" && this.getTabBar()) {
      this.getTabBar().setMallTab(1);
    }
  },
  async getCategory() {
    wx.showLoading({
      title: "",
    });

    const result = await getCateList();
    wx.hideLoading();

    let activeCategory = 0;
    let categorySelected = this.data.categorySelected;

    const firstCategories = result.data;
    if (categorySelected.category_id) {
      activeCategory = firstCategories.findIndex((ele) => {
        return ele.category_id == categorySelected.category_id;
      });
      categorySelected = firstCategories[activeCategory];
    } else {
      categorySelected = firstCategories[0];
    }

    this.setData({
      page: 1,
      activeCategory,
      firstCategories,
      categorySelected,
    });

    this.getSecondCategory();
  },
  async getSecondCategory() {
    wx.showLoading({
      title: "",
    });

    const result = await getCateList({
      category_id: this.data.categorySelected.category_id,
    });
    wx.hideLoading();

    const secondCategories = result.data;
    const secondCategorySelected = secondCategories[0] || {};

    this.setData({
      secondCategories: secondCategories,
      secondCategorySelected,
    });

    this.getGoodsList();
  },
  async getGoodsList() {
    wx.showLoading({
      title: "",
    });

    const _data = {
      order: 1,
      by: 1,
      page: this.data.page,
      size: 10,
      category_id: this.data.secondCategorySelected.category_id,
    };

    const result = await getGoodsList(_data);
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

  async onCategoryClick(e) {
    const idx = e.target.dataset.idx;
    if (idx == this.data.activeCategory) {
      this.setData({
        scrolltop: 0,
      });
      return;
    }
    const categorySelected = this.data.firstCategories[idx];

    this.setData({
      page: 1,
      activeCategory: idx,
      categorySelected,
      scrolltop: 0,
    });
    this.getSecondCategory();
  },
  onSecondCategoryClick(e) {
    const idx = e.target.dataset.idx;

    // 点击了具体的分类
    const secondCategorySelected = this.data.secondCategories[idx];

    this.setData({
      scrolltop: 0,
      page: 1,
      secondCategorySelected,
    });
    this.getGoodsList();
  },
  bindconfirm(e) {
    this.setData({
      inputVal: e.detail,
    });
    wx.navigateTo({
      url: "/pages/goods/list?name=" + this.data.inputVal,
    });
  },
  // onShareAppMessage() {
  //   return {
  //     title:
  //       '"' +
  //       wx.getStorageSync("mallName") +
  //       '" ' +
  //       wx.getStorageSync("share_profile"),
  //     path: "/pages/index/index?inviter_id=" + wx.getStorageSync("uid"),
  //   };
  // },
  async addShopCar(e) {
    const curGood = this.data.goods.find((ele) => {
      return ele.goods_id == e.currentTarget.dataset.id;
    });
    if (!curGood) {
      return;
    }

    const goods_id = e.currentTarget.dataset.id;
    const cart_list = [
      {
        goods_num: 1,
        goods_id: goods_id,
      },
    ];

    const params = {
      token: wx.getStorageSync("token"),
      cart_list: JSON.stringify(cart_list),
    };

    const result = await createCartBatch(params);

    wx.showToast({
      title: "加入购物车成功",
      icon: "success",
    });

    // if (curGood.stock <= 0) {
    //   wx.showToast({
    //     title: "已售罄~",
    //     icon: "none",
    //   });
    //   return;
    // }

    // this.setData({
    //   skuCurGoods: curGood,
    // });
  },
  goodsGoBottom() {
    this.data.page++;
    this.getGoodsList();
  },
});
