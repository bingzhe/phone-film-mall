const WXAPI = require("apifm-wxapi");
import { getOpenid } from "../api/api";

async function checkSession() {
  return new Promise((resolve, reject) => {
    wx.checkSession({
      success() {
        return resolve(true);
      },
      fail() {
        return resolve(false);
      },
    });
  });
}

async function bindSeller() {
  const token = wx.getStorageSync("token");
  const referrer = wx.getStorageSync("referrer");
  if (!token) {
    return;
  }
  if (!referrer) {
    return;
  }
  const res = await WXAPI.bindSeller({
    token,
    uid: referrer,
  });
}

// 检测登录状态，返回 true / false
async function checkHasLogined() {
  const token = wx.getStorageSync("token");
  if (!token) {
    return false;
  }
  // const loggined = await checkSession()
  // if (!loggined) {
  //   wx.removeStorageSync('token')
  //   return false
  // }
  // const checkTokenRes = await WXAPI.checkToken(token)
  // if (checkTokenRes.code != 0) {
  //   wx.removeStorageSync('token')
  //   return false
  // }
  return true;
}

async function wxaCode() {
  return new Promise((resolve, reject) => {
    wx.login({
      success(res) {
        return resolve(res.code);
      },
      fail() {
        wx.showToast({
          title: "获取code失败",
          icon: "none",
        });
        return resolve("获取code失败");
      },
    });
  });
}

async function login(page) {
  wx.login({
    success: function (res) {
      const code = res.code;

      getOpenid({ code: code }).then(function (res) {
        console.log("getOpenid", res);
        wx.setStorageSync("token", res.data);

        if (page) {
          page.onShow();
        }
      });
    },
    fail: function (err) {
      console.log("登录错误", err);
      wx.removeStorageSync("token");
    },
  });
}

async function authorize() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: function (res) {
        const code = res.code;
        getOpenid({ code: code }).then(function (res) {
          console.log("getOpenid", res);
          wx.setStorageSync("token", res.data);
        });
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
}

function loginOut() {
  wx.removeStorageSync("token");
  wx.removeStorageSync("uid");
}

async function checkAndAuthorize(scope) {
  return new Promise((resolve, reject) => {
    wx.getSetting({
      success(res) {
        if (!res.authSetting[scope]) {
          wx.authorize({
            scope: scope,
            success() {
              resolve(); // 无返回参数
            },
            fail(e) {
              console.error(e);
              // if (e.errMsg.indexof('auth deny') != -1) {
              //   wx.showToast({
              //     title: e.errMsg,
              //     icon: 'none'
              //   })
              // }
              wx.showModal({
                title: "无权操作",
                content: "需要获得您的授权",
                showCancel: false,
                confirmText: "立即授权",
                confirmColor: "#e64340",
                success(res) {
                  wx.openSetting();
                },
                fail(e) {
                  console.error(e);
                  reject(e);
                },
              });
            },
          });
        } else {
          resolve(); // 无返回参数
        }
      },
      fail(e) {
        console.error(e);
        reject(e);
      },
    });
  });
}

module.exports = {
  checkHasLogined: checkHasLogined,
  wxaCode: wxaCode,
  login: login,
  loginOut: loginOut,
  checkAndAuthorize: checkAndAuthorize,
  authorize: authorize,
  bindSeller: bindSeller,
};
