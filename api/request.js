import { API_BASE_URL, API_FILE_URL } from "./config";

const app = getApp();

function request(url, params = {}, method = "POST", options = {}) {
  //默认值get
  //options.header 表示请求头类型，默认是JSON类型，如果需要切换form类型，请求里传入form即可（workon旧版本请求可能需要此项）
  return new Promise(function (resolve, reject) {
    wx.request({
      url: `${API_BASE_URL}${url}`,
      data: params,
      method: method,
      header: {
        "content-Type": "application/x-www-form-urlencoded",
        // "content-type":
        //   options.header === "form"
        //     ? "application/x-www-form-urlencoded"
        //     : "application/json;charset=UTF-8",
        "X-Access-Token": wx.getStorageSync("token")
          ? wx.getStorageSync("token")
          : "",
      },
      success: function (res) {
        if (res.data.code === 200 || res.data.code === 0) {
          resolve(res.data);
        } else {
          if (res.data.code === 401) {
            app.globalData.token = "";
            wx.removeStorageSync("token");
            setTimeout(() => {
              wx.reLaunch({
                url: "/pages/login/login",
              });
            }, 1500);
          }

          wx.showToast({
            title: res.data.meg,
            icon: "none",
            duration: 1500,
          });
          reject(res.data);
        }
      },
      fail: function (err) {
        wx.showToast({
          title: "服务器连接异常，请检查网络再试",
          icon: "none",
          duration: 1500,
        });
        reject(err);
      },
    });
  });
}

function uploadFile(url, filePath) {
  return new Promise(function (resolve, reject) {
    wx.uploadFile({
      url: `${API_FILE_URL}${url}`,
      filePath: filePath,
      name: "file",
      header: {
        "X-Access-Token": wx.getStorageSync("token")
          ? wx.getStorageSync("token")
          : "",
      },
      success(res) {
        try {
          const resultStr = res.data;
          const result = JSON.parse(resultStr);

          if (result.code === 200 || result.code === 0) {
            resolve(result);
          } else {
            wx.showToast({
              title: result.meg,
              icon: "none",
              duration: 1500,
            });
            reject(result);
          }
        } catch (error) {
          wx.showToast({
            title: "服务器连接异常，请检查网络再试",
            icon: "none",
            duration: 1500,
          });
          reject(error);
        }
      },
      fail(res) {
        wx.showToast({
          title: "服务器连接异常，请检查网络再试",
          icon: "none",
          duration: 1500,
        });
        reject(res);
      },
    });
  });
}

module.exports = {
  request,
  uploadFile,
};
