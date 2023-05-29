import { checkLogined } from "../utils/auth.js";

Component({
  data: {
    selected: 0,
    color: "#707070",
    selectedColor: "#23b7eb",
    list: [
      {
        pagePath: "/pages/film-index/film-index",
        iconPath: "/images/nav/home-off.png",
        selectedIconPath: "/images/nav/home-on.png",
        text: "搜索",
      },
      {
        pagePath: "/pages/film-video/film-video",
        iconPath: "/images/nav/video-off.png",
        selectedIconPath: "/images/nav/video-on.png",
        text: "教程",
      },
      {
        pagePath: "/pages/category/category",
        iconPath: "/images/nav/fl-off.png",
        selectedIconPath: "/images/nav/fl-on.png",
        text: "商城",
      },
    ],
  },
  attached() {},
  methods: {
    async switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      if (url == "/pages/category/category") {
        await checkLogined();
      }
      wx.switchTab({ url });
      this.setData({
        selected: data.index,
      });
    },
    setSearchTab(i) {
      const list = [
        {
          pagePath: "/pages/film-index/film-index",
          iconPath: "/images/nav/home-off.png",
          selectedIconPath: "/images/nav/home-on.png",
          text: "搜索",
        },
        {
          pagePath: "/pages/film-video/film-video",
          iconPath: "/images/nav/video-off.png",
          selectedIconPath: "/images/nav/video-on.png",
          text: "教程",
        },
        {
          pagePath: "/pages/category/category",
          iconPath: "/images/nav/fl-off.png",
          selectedIconPath: "/images/nav/fl-on.png",
          text: "商城",
        },
      ];

      this.setData({
        list: list,
        selected: i,
      });
    },
    setMallTab(i) {
      const list = [
        {
          pagePath: "/pages/film-index/film-index",
          iconPath: "/images/nav/home-off.png",
          selectedIconPath: "/images/nav/home-on.png",
          text: "搜索",
        },
        {
          pagePath: "/pages/category/category",
          iconPath: "/images/nav/fl-off.png",
          selectedIconPath: "/images/nav/fl-on.png",
          text: "分类",
        },
        {
          pagePath: "/pages/shop-cart/index",
          iconPath: "/images/nav/cart-off.png",
          selectedIconPath: "/images/nav/cart-on.png",
          text: "购物车",
        },
        {
          pagePath: "/pages/my/index",
          iconPath: "/images/nav/my-off.png",
          selectedIconPath: "/images/nav/my-on.png",
          text: "我的",
        },
      ];

      this.setData({
        list: list,
        selected: i,
      });
    },
  },
});
