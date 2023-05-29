const WXAPI = require("apifm-wxapi");
const CONFIG = require("config.js");
const AUTH = require("utils/auth");

App({
  onLaunch: function () {
    const subDomain = wx.getExtConfigSync().subDomain;
    if (subDomain) {
      WXAPI.init(subDomain);
    } else {
      WXAPI.init(CONFIG.subDomain);
      WXAPI.setMerchantId(CONFIG.merchantId);
    }

    const that = this;
    // 检测新版本
    const updateManager = wx.getUpdateManager();
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: "更新提示",
        content: "新版本已经准备好，是否重启应用？",
        success(res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate();
          }
        },
      });
    });
    /**
     * 初次加载判断网络情况
     * 无网络状态下根据实际情况进行调整
     */
    wx.getNetworkType({
      success(res) {
        const networkType = res.networkType;
        if (networkType === "none") {
          that.globalData.isConnected = false;
          wx.showToast({
            title: "当前无网络",
            icon: "loading",
            duration: 2000,
          });
        }
      },
    });
    /**
     * 监听网络状态变化
     * 可根据业务需求进行调整
     */
    wx.onNetworkStatusChange(function (res) {
      if (!res.isConnected) {
        that.globalData.isConnected = false;
        wx.showToast({
          title: "网络已断开",
          icon: "loading",
          duration: 2000,
        });
      } else {
        that.globalData.isConnected = true;
        wx.hideToast();
      }
    });

    // ---------------检测navbar高度
    let menuButtonObject = wx.getMenuButtonBoundingClientRect();
    console.log("小程序胶囊信息", menuButtonObject);
    wx.getSystemInfo({
      success: (res) => {
        let statusBarHeight = res.statusBarHeight,
          navTop = menuButtonObject.top, //胶囊按钮与顶部的距离
          navHeight =
            statusBarHeight +
            menuButtonObject.height +
            (menuButtonObject.top - statusBarHeight) * 2; //导航高度
        this.globalData.navHeight = navHeight;
        this.globalData.navTop = navTop;
        this.globalData.windowHeight = res.windowHeight;
        this.globalData.menuButtonObject = menuButtonObject;
        console.log("navHeight", navHeight);
      },
      fail(err) {
        console.log(err);
      },
    });

    //获取设备信息
    wx.getSystemInfo({
      success: function (res) {
        console.log(res);
        // iPhone机型有横杆的导航栏高度大于40
        if (res.safeArea.top > 40) {
          that.globalData.isIphoneX = true;
        }
      },
    });
  },

  onShow(e) {
    // 自动登录
    // AUTH.login();
  },
  globalData: {
    isConnected: true,
    sdkAppID: CONFIG.sdkAppID,
    isIphoneX: false, //有横杆iphone
  },
});
