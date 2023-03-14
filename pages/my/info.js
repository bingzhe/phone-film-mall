import { getUsersinfo, savePhone } from "../../api/api.js";

Page({
  data: {
    avatarUrl: undefined,
    avatarUrlTmpFile: undefined,
    gender: undefined,
    genderArray: ["男性", "女性"],
    genderIndex: -1,
    phone: "",
  },
  onLoad: function (options) {
    this.getUserApiInfo();
  },
  onShow: function () {},
  getPhoneNumber: function (e) {
    if (!e.detail.errMsg || e.detail.errMsg != "getPhoneNumber:ok") {
      wx.showModal({
        title: "提示",
        content: e.detail.errMsg,
        showCancel: false,
      });
      return;
    }
    this._getPhoneNumber(e);
  },
  async _getPhoneNumber(e) {
    await savePhone({
      token: wx.getStorageSync("token"),
      code: e.detail.code,
    });

    wx.showToast({
      title: "绑定成功",
      icon: "success",
      duration: 2000,
    });
    this.getUserApiInfo();
  },
  async getUserApiInfo() {
    const res = await getUsersinfo({ token: wx.getStorageSync("token") });

    this.setData({
      phone: res.data.phone,
    });
  },
  // async formSubmit(e) {
  //   console.log(e);
  //   const postData = {
  //     token: wx.getStorageSync("token"),
  //     nick: this.data.nick,
  //   };
  //   if (this.data.avatarUrlTmpFile) {
  //     const res = await WXAPI.uploadFile(
  //       wx.getStorageSync("token"),
  //       this.data.avatarUrlTmpFile
  //     );
  //     if (res.code == 0) {
  //       postData.avatarUrl = res.data.url;
  //     }
  //   }
  //   if (this.data.genderIndex != -1) {
  //     postData.gender = this.data.genderIndex * 1 + 1;
  //   }
  //   postData.extJsonStr = JSON.stringify(e.detail.value);
  //   console.log(postData);
  //   const res = await WXAPI.modifyUserInfo(postData);
  //   if (res.code != 0) {
  //     wx.showToast({
  //       title: res.msg,
  //       icon: "none",
  //     });
  //   }
  //   wx.showToast({
  //     title: "编辑成功",
  //   });
  //   setTimeout(() => {
  //     wx.navigateBack({
  //       delta: 0,
  //     });
  //   }, 1000);
  // },
  // async onChooseAvatar(e) {
  //   console.log(e);
  //   const avatarUrl = e.detail.avatarUrl;
  //   this.setData({
  //     avatarUrl: avatarUrl,
  //     avatarUrlTmpFile: avatarUrl,
  //   });
  // },
  // bindPickerChange: function (e) {
  //   this.setData({
  //     genderIndex: e.detail.value,
  //     gender: this.data.genderArray[e.detail.value],
  //   });
  // },
});
