const WXAPI = require("apifm-wxapi");
import { registerGetOpenid } from "../../utils/auth";
import { registerApi } from "../../api/api";

Page({
  /**
   * 页面的初始数据
   */
  data: {
    openid: "",
    username: "",
    password: "",
    invitation_id: "",
    name: "",
    company_name: "",
    province: "",
    city: "",
    area: "",
    address: "",
    checked: false,

    provinces: undefined, // 省份数据数组
    pIndex: 0, //选择的省下标
    cities: undefined, // 城市数据数组
    cIndex: 0, //选择的市下标
    areas: undefined, // 区县数数组
    aIndex: 0, //选择的区下标
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.provinces();
    this.getRegisterOpenid();
  },

  onShow: function () {
    // postPageView("13");
  },

  async getRegisterOpenid() {
    const openid = await registerGetOpenid();

    this.setData({
      openid,
    });
  },

  bindUsernameInput: function (e) {
    this.setData({
      username: e.detail.value,
    });
  },
  bindPasswordInput: function (e) {
    this.setData({
      password: e.detail.value,
    });
  },
  bindInvitationIdInput: function (e) {
    this.setData({
      invitation_id: e.detail.value,
    });
  },
  bindNameInput: function (e) {
    this.setData({
      name: e.detail.value,
    });
  },
  bindCompanyNameInput: function (e) {
    this.setData({
      company_name: e.detail.value,
    });
  },
  bindAddressInput: function (e) {
    this.setData({
      address: e.detail.value,
    });
  },

  async provinces(provinceId, cityId, districtId, streetId) {
    const res = await WXAPI.province();
    if (res.code == 0) {
      const provinces = [
        {
          id: 0,
          name: "请选择省份",
        },
      ].concat(res.data);
      let pIndex = 0;
      if (provinceId) {
        pIndex = provinces.findIndex((ele) => {
          return ele.id == provinceId;
        });
      }
      this.setData({
        pIndex,
        provinces: provinces,
      });
      if (provinceId) {
        const e = { detail: { value: pIndex } };
        this.provinceChange(e, cityId, districtId, streetId);
      }
    }
  },
  async provinceChange(e, cityId, districtId, streetId) {
    const index = e.detail.value;
    this.setData({
      pIndex: index,
    });
    const pid = this.data.provinces[index].id;
    if (pid == 0) {
      this.setData({
        cities: null,
        cIndex: 0,
        areas: null,
        aIndex: 0,
      });
      return;
    }
    const res = await WXAPI.nextRegion(pid);
    if (res.code == 0) {
      const cities = [
        {
          id: 0,
          name: "请选择城市",
        },
      ].concat(res.data);
      let cIndex = 0;
      if (cityId) {
        cIndex = cities.findIndex((ele) => {
          return ele.id == cityId;
        });
      }
      this.setData({
        cIndex,
        cities: cities,
      });
      if (cityId) {
        const e = { detail: { value: cIndex } };
        this.cityChange(e, districtId, streetId);
      }
    }
  },
  async cityChange(e, districtId, streetId) {
    const index = e.detail.value;
    this.setData({
      cIndex: index,
    });
    const pid = this.data.cities[index].id;
    if (pid == 0) {
      this.setData({
        areas: null,
        aIndex: 0,
      });
      return;
    }
    const res = await WXAPI.nextRegion(pid);
    if (res.code == 0) {
      const areas = [
        {
          id: 0,
          name: "请选择区县",
        },
      ].concat(res.data);
      let aIndex = 0;
      if (districtId) {
        aIndex = areas.findIndex((ele) => {
          return ele.id == districtId;
        });
      }
      this.setData({
        aIndex,
        areas: areas,
      });
      if (districtId) {
        const e = { detail: { value: aIndex } };
        this.areaChange(e, streetId);
      }
    }
  },
  async areaChange(e, streetId) {
    const index = e.detail.value;
    this.setData({
      aIndex: index,
    });

    const shipping_address_region_level = 3;
    if (shipping_address_region_level == 3) {
      return;
    }
  },

  onCheckChange(event) {
    this.setData({
      checked: event.detail,
    });
  },

  async registerAction() {
    if (!this.data.checked) {
      wx.showToast({
        title: "请同意用户协议和隐私协议在登录",
        icon: "none",
        duration: 1500,
      });
      return;
    }

    if (!this.data.username) {
      wx.showToast({
        title: "请输入手机号",
        icon: "none",
        duration: 1500,
      });
      return;
    }

    if (!this.data.invitation_id) {
      wx.showToast({
        title: "请输入邀请ID",
        icon: "none",
        duration: 1500,
      });
      return;
    }

    if (!this.data.password) {
      wx.showToast({
        title: "请输入密码",
        icon: "none",
        duration: 1500,
      });
      return;
    }

    if (!this.data.company_name) {
      wx.showToast({
        title: "请输入公司名",
        icon: "none",
        duration: 1500,
      });
      return;
    }

    if (!this.data.name) {
      wx.showToast({
        title: "请输入姓名",
        icon: "none",
        duration: 1500,
      });
      return;
    }

    if (this.data.pIndex == 0) {
      wx.showToast({
        title: "请选择省份",
        icon: "none",
      });
      return;
    }
    if (this.data.cIndex == 0) {
      wx.showToast({
        title: "请选择城市",
        icon: "none",
      });
      return;
    }
    if (this.data.aIndex == 0) {
      wx.showToast({
        title: "请选择区县",
        icon: "none",
      });
      return;
    }

    if (!this.data.name) {
      wx.showToast({
        title: "请输入详细地址",
        icon: "none",
        duration: 1500,
      });
      return;
    }

    const params = {
      openid: this.data.openid,
      username: this.data.username,
      password: this.data.password,
      invitation_id: this.data.invitation_id,
      name: this.data.name,
      company_name: this.data.company_name,
      address: this.data.address,
    };

    if (this.data.pIndex > 0) {
      params.province = this.data.provinces[this.data.pIndex].name;
    }
    if (this.data.cIndex > 0) {
      params.city = this.data.cities[this.data.cIndex].name;
    }
    if (this.data.aIndex > 0) {
      params.area = this.data.areas[this.data.aIndex].name;
    }

    await registerApi(params);

    wx.showToast({
      title: "注册成功",
      icon: "none",
      duration: 1500,
    });

    setTimeout(() => {
      this._goBack();
    }, 1500);
  },

  _goBack: function () {
    wx.navigateBack({
      delta: 1,
    });
  },
  gotoPrivacy() {
    wx.navigateTo({
      url: "/pages/ysxy/ysxy",
    });
  },
  gotoUser() {
    wx.navigateTo({
      url: "/pages/yhxy/yhxy",
    });
  },
  goRegister() {
    wx.navigateTo({
      url: "/pages/register/register",
    });
  },
});
