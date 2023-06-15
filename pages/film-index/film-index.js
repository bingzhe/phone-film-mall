// 获取应用实例
import {
  rootUrl,
  getCateListApi,
  getGoodsListApi,
  getGoodsListPageApi,
  getNewProductApi,
  getBannerListApi,
  getPhoneNameApi,
  getGoodsCateApi,
  getNameListApi,
  getAnnouncementApi,
} from "../../api/filmApi";

const app = getApp();

Page({
  data: {
    imgSrcs: [
      // {
      //   img: "https://cdn-we-retail.ym.tencent.com/tsr/home/v2/banner3.png",
      //   text: "1",
      // },
    ],
    tabList: [],
    list: [],

    //swiper
    current: 1,
    autoplay: true,
    duration: 500,
    interval: 5000,
    navigation: { type: "dots" },

    phoneModal: "",

    tabIndex: 100,

    searchValue: "",

    searchType: 2, // 1 输入框查询 2 本机查询

    rootUrl: rootUrl,

    searchNameList: [],

    showTabs: true,

    showNotice: false,
    text: "",
    animation: null,
    timer: null,
    duration: 0,
    textWidth: 0,
    wrapWidth: 0,

    page: 1,
    size: 10,
    total: 100,

    popupShow: false,
    newProductContent: "",
    newProductBg: "",

    isIphoneX: app.globalData.isIphoneX,
  },
  async onLoad() {
    await this.getDeviceInfo();
    // this.getNewProduct();
    this.getCateList();
    // this.getGoodsCate();
    this.getAnnouncement();
  },
  onShow() {
    wx.hideTabBar({
      fail: function () {
        setTimeout(function () {
          wx.hideTabBar();
        }, 500);
      },
    });

    if (typeof this.getTabBar === "function" && this.getTabBar()) {
      this.getTabBar().setSearchTab(0);
    }
  },
  onReady: function () {
    wx.hideTabBar({
      fail: function () {
        setTimeout(function () {
          wx.hideTabBar();
        }, 500);
      },
    });
  },
  onHide() {},
  onUnload() {},
  onShareAppMessage() {
    // return {
    //   title: '卡陌牛 卡陌牛守护您的爱机',
    // }
  },
  onShareTimeline() {
    // return {
    //   title: '卡陌牛 卡陌牛守护您的爱机',
    // }
  },
  async getNewProduct() {
    const result = await getNewProductApi();
    const data = result.data;
    if (!data) {
      return;
    }
    this.showPopup();
    this.setData({
      newProductContent: data.content,
      newProductBg: data.bg_img,
    });
    console.log(result);
  },
  async getGoodsCate() {
    const data = {};

    if (this.data.searchType == 1 && this.data.searchValue) {
      data.name = this.data.searchValue;
    }

    if (this.data.searchType == 2 && this.data.phoneModal) {
      data.name = this.data.phoneModal;
    }

    const result = await getGoodsCateApi(data);

    if (result.code !== 200) return;

    // this.setData({
    //   tabIndex: result.data,
    // });

    this.setData({
      // tabIndex: 100,
      tabIndex: result.data,
      page: 1,
      list: [],
    });

    this.getGoodsList();
  },
  async getCateList() {
    const result = await getCateListApi();

    if (result.code !== 200) return;

    result.data.unshift({
      cate_id: 100,
      cate_name: "全部",
    });

    this.setData({
      tabList: result.data,
    });

    const firstCateId = (result.data[0] || {}).cate_id;

    if (firstCateId) {
      this.setData({
        tabIndex: firstCateId,
      });
    }

    await this.getGoodsList();
    this.getBannerList();
  },
  async getGoodsList() {
    const data = {
      // cate_id: this.data.tabIndex,
      page: this.data.page,
      size: this.data.size,
    };

    if (this.data.tabIndex != 100) {
      data.cate_id = this.data.tabIndex;
    }

    if (this.data.searchType == 1 && this.data.searchValue) {
      data.name = this.data.searchValue;
    }

    if (this.data.searchType == 2 && this.data.phoneModal) {
      data.name = this.data.phoneModal;
    }

    const result = await getGoodsListPageApi(data);
    if (result.code !== 200) return;

    // result.data.list.forEach((item) => {
    //   item.selectList = item.spec_list.filter((spec) => spec.is_checked == 1);
    //   item.spec_list = item.spec_list.filter((spec) => spec.is_checked != 1);
    //   item.expand = item.selectList.length == 0 ? true : false;
    // });

    this.setData({
      total: result.data.count,
      list: this.data.list.concat(result.data.list),
    });
  },

  toggleExpand(e) {
    const index = e.currentTarget.dataset.index;
    const cur = this.data.list[index];
    cur.expand = !cur.expand;

    this.setData({
      ["list[" + index + "]"]: cur,
    });
  },

  async getBannerList() {
    const result = await getBannerListApi();
    if (result.code !== 200) return;

    const list = (result.data || []).map((item) => {
      return {
        ...item,
        img: `${rootUrl}${item.img_url}`,
        text: item.id,
      };
    });

    this.setData({
      imgSrcs: list,
    });
  },
  async getDeviceInfo() {
    const deviceInfo = wx.getDeviceInfo();

    let model = deviceInfo.model;
    const system = deviceInfo.system;

    //单独处理 iPhone XS Max China-exclusive<iPhone11,6>
    model = model.replace(/China-exclusive/gm, "");

    //如果是ios,单独处理下里面的尖括号
    let ios = !!(system.toLowerCase().search("ios") + 1);
    if (ios) {
      model = model.replace(/\((\S*?)\)<(\S*?)>/gm, "");
      model = model.replace(/<(\S*?)>/gm, "");
    }

    const params = {
      name: model,
    };

    const result = await getPhoneNameApi(params);

    const phoneModal = result.data ? result.data : model;

    this.setData({ phoneModal: phoneModal });
  },

  handleSearchClick() {
    this.setData({
      searchType: 1,
      // tabIndex: 100,
      page: 1,
      list: [],
    });
    this.getGoodsList();
  },
  handleSearchCus() {
    this.setData({
      searchType: 2,
      page: 1,
      list: [],
    });
    this.getGoodsList();
  },
  // tabChangeHandle(e) {
  //   this.setData({
  //     tabIndex: e.detail.value,
  //     page: 1,
  //     list: [],
  //   });
  //   this.getGoodsList();
  // },
  ontabItemClick(e) {
    const tabIndex = e.currentTarget.dataset.cateid;
    this.setData({ tabIndex, page: 1, list: [] });
    this.getGoodsList();
  },
  handleSearchClear() {
    this.setData({
      searchNameList: [],
      showTabs: true,
    });
  },
  async handleSearchChange(e) {
    const name = e.detail.value;

    if (name) {
      this.setData({
        showTabs: false,
      });
    } else {
      this.setData({
        showTabs: true,
      });
    }

    const params = { name };

    const result = await getNameListApi(params);
    if (result.code !== 200) return;

    const getInf = (str, key) =>
      str.replace(new RegExp(`${key}`, "gi"), `%%$&%%`).split("%%");

    const nameList = result.data.map((item) => {
      return getInf(item, this.data.searchValue);
    });

    this.setData({
      searchNameList: nameList,
    });
  },
  handleSearchNameItemClick(e) {
    const nameArr = e.currentTarget.dataset.name || [];
    const name = nameArr.join("");

    this.setData({
      searchValue: name,
      showTabs: true,
    });

    this.setData({
      searchType: 1,
    });
    this.getGoodsCate();
  },
  async getAnnouncement() {
    const result = await getAnnouncementApi();

    const list = result.data || [];

    if (list.length > 0) {
      this.setData({
        showNotice: true,
      });
    } else {
      return;
    }

    const text = list.map((item, i) => `${i + 1}：${item.content}  `).join(" ");

    this.setData({
      text: text,
    });
  },
  onReachBottom() {
    if (this.data.list.length == this.data.total && this.data.page != 1) {
      // wx.showToast({
      //   title: "没有更多了",
      //   icon: "none",
      // });
      return;
    }

    this.setData({
      page: this.data.page + 1,
    });
    this.getGoodsList();
  },
  // handleToVideo() {
  //   wx.navigateTo({
  //     url: "/pages/video/video",
  //   });
  // },
  // handleToFeed() {
  //   wx.navigateTo({
  //     url: "/pages/feedback/feedback",
  //   });
  // },
  showPopup() {
    this.setData({ popupShow: true });
  },

  onClose() {
    this.setData({ popupShow: false });
  },
});
