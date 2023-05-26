const WXAPI = require("apifm-wxapi");

import { getOpenid, getUsersinfo } from "../api/api";

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

// 检查登录
async function checkLogined() {
  wx.login({
    success: async function (res) {
      const code = res.code;

      const openIdResult = await getOpenid({ code: code });
      const token = openIdResult.data;
      const openid = openIdResult.data.openid;

      // openid存在 跳转登录页
      if (openid) {
        wx.navigateTo({
          url: "/pages/login/login",
        });
        return;
      }

      const userResult = await getUsersinfo({ token });

      const status = userResult.data.status;

      // TODO 恢复判断条件 判断是否登录 status   0待审核1正常2禁止登录
      if (status == 0 || status == 2) {
      // if (status == 2) {
        wx.redirectTo({
          url: `/pages/disabled-mall/disabled-mall?status=${status}`,
        });
      }
      wx.setStorageSync("token", token);
    },
    fail: function (err) {
      console.log("检查登录", err);
      wx.removeStorageSync("token");
    },
  });
}

// 检测登录状态，返回 true / false
async function checkHasLogined() {
  const token = wx.getStorageSync("token");

  if (!token) {
    return false;
  }

  return true;
}

// 注册时候取Openid
async function registerGetOpenid() {
  return new Promise(function (resolve, reject) {
    wx.login({
      success: async function (res) {
        const code = res.code;

        const openIdResult = await getOpenid({ code: code });
        const openid = openIdResult.data.openid;

        // if (token) {
        //   wx.showToast({
        //     title: "该微信以及注册过账号",
        //     icon: "none",
        //     duration: 1500,
        //   });
        // }

        if (openid) {
          resolve(openid);
        }
      },
      fail: function (err) {
        reject(err);
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
  // return new Promise((resolve, reject) => {
  //   wx.getSetting({
  //     success(res) {
  //       if (!res.authSetting[scope]) {
  //         wx.authorize({
  //           scope: scope,
  //           success() {
  //             resolve(); // 无返回参数
  //           },
  //           fail(e) {
  //             console.error(e);
  //             // if (e.errMsg.indexof('auth deny') != -1) {
  //             //   wx.showToast({
  //             //     title: e.errMsg,
  //             //     icon: 'none'
  //             //   })
  //             // }
  //             wx.showModal({
  //               title: "无权操作",
  //               content: "需要获得您的授权",
  //               showCancel: false,
  //               confirmText: "立即授权",
  //               confirmColor: "#e64340",
  //               success(res) {
  //                 wx.openSetting();
  //               },
  //               fail(e) {
  //                 console.error(e);
  //                 reject(e);
  //               },
  //             });
  //           },
  //         });
  //       } else {
  //         resolve(); // 无返回参数
  //       }
  //     },
  //     fail(e) {
  //       console.error(e);
  //       reject(e);
  //     },
  //   });
  // });
}

module.exports = {
  checkHasLogined: checkHasLogined,
  login: login,
  loginOut: loginOut,
  checkAndAuthorize: checkAndAuthorize,
  authorize: authorize,
  bindSeller: bindSeller,
  checkLogined: checkLogined,
  registerGetOpenid: registerGetOpenid,
};
