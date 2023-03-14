import { getCateList } from "../../api/api.js";
import { BASE_URL } from "../../api/config.js";

Page({
  /**
   * 页面的初始数据
   */
  data: {
    categoryMod: 2,

    categories: [],
    firstCategories: [],
    activeCategory: 0,
    categorySelected: {
      // cate_name: "",
      // category_id: "",
    },
    secondCategories: [],
    currentGoods: [],
    onLoadStatus: true,
    scrolltop: 0,

    skuCurGoods: undefined,
    page: 1,
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
    this.categories();
  },
  async categories() {
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
    this.getGoodsList();
  },
  async getGoodsList() {
    wx.showLoading({
      title: "",
    });

    // https://www.yuque.com/apifm/nu0f75/wg5t98

    const result = await getCateList({
      category_id: this.data.categorySelected.category_id,
    });
    wx.hideLoading();

    const secondCategories = result.data.map((item) => {
      item.icon = `${BASE_URL}${item.icon_url}`;

      return item;
    });

    this.setData({
      secondCategories: secondCategories,
    });
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
      secondCategoryId: "",
      activeCategory: idx,
      categorySelected,
      scrolltop: 0,
    });
    this.getGoodsList();
  },
  onSecondCategoryClick(e) {
    const idx = e.detail.index;
    let secondCategoryId = "";
    if (idx) {
      // 点击了具体的分类
      secondCategoryId = this.data.categorySelected.childs[idx - 1].id;
    }
    this.setData({
      page: 1,
      secondCategoryId,
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
  onShareAppMessage() {
    return {
      title:
        '"' +
        wx.getStorageSync("mallName") +
        '" ' +
        wx.getStorageSync("share_profile"),
      path: "/pages/index/index?inviter_id=" + wx.getStorageSync("uid"),
    };
  },
  onShow() {
    // AUTH.checkHasLogined().then((isLogined) => {
    //   if (isLogined) {
    //     this.setData({
    //       wxlogin: isLogined,
    //     });
    //     TOOLS.showTabBarBadge(); // 获取购物车数据，显示TabBarBadge
    //   }
    // });
    const _categoryId = wx.getStorageSync("_categoryId");
    wx.removeStorageSync("_categoryId");
    if (_categoryId) {
      this.data.categorySelected.category_id = _categoryId;
      this.categories();
    }
  },
  goodsGoBottom() {
    this.data.page++;
    this.getGoodsList();
  },
  adPositionClick(e) {
    const url = e.target.dataset.url;
    if (url) {
      wx.navigateTo({
        url: url,
      });
    }
  },
  searchscan() {
    wx.scanCode({
      scanType: ["barCode", "qrCode", "datamatrix", "pdf417"],
      success: (res) => {
        this.setData({
          inputVal: res.result,
        });
        wx.navigateTo({
          url: "/pages/goods/list?name=" + res.result,
        });
      },
    });
  },
});
