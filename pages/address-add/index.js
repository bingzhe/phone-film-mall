const WXAPI = require("apifm-wxapi");
const AUTH = require("../../utils/auth");
var address_parse = require("../../utils/address_parse");
import { saveAddress, delAddress, getAddressInfo } from "../../api/api";

Page({
  data: {
    provinces: undefined, // 省份数据数组
    pIndex: 0, //选择的省下标
    cities: undefined, // 城市数据数组
    cIndex: 0, //选择的市下标
    areas: undefined, // 区县数数组
    aIndex: 0, //选择的区下标
  },
  async provinces(provinceId, cityId, districtId, streetId) {
    const res = await WXAPI.province();
    if (res.code == 0) {
      const provinces = [
        {
          id: 0,
          name: "请选择",
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
          name: "请选择",
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
          name: "请选择",
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
    //
    const pid = this.data.areas[index].id;
    if (pid == 0) {
      this.setData({
        streets: null,
        sIndex: 0,
      });
      return;
    }
    const res = await WXAPI.nextRegion(pid);
    if (res.code == 0) {
      const streets = [
        {
          id: 0,
          name: "请选择",
        },
      ].concat(res.data);
      let sIndex = 0;
      if (streetId) {
        sIndex = streets.findIndex((ele) => {
          return ele.id == streetId;
        });
      }
      this.setData({
        sIndex,
        streets,
      });
      if (streetId) {
        const e = { detail: { value: sIndex } };
        this.streetChange(e);
      }
    }
  },
  async streetChange(e) {
    const index = e.detail.value;
    this.setData({
      sIndex: index,
    });
  },
  async bindSave() {
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

    const linkMan = this.data.linkMan;
    const address = this.data.address;
    const mobile = this.data.mobile;

    if (!linkMan) {
      wx.showToast({
        title: "请填写联系人姓名",
        icon: "none",
      });
      return;
    }
    if (!mobile) {
      wx.showToast({
        title: "请填写手机号码",
        icon: "none",
      });
      return;
    }
    if (!address) {
      wx.showToast({
        title: "请填写详细地址",
        icon: "none",
      });
      return;
    }

    const postData = {
      token: wx.getStorageSync("token"),
      name: linkMan,
      address: address,
      telephone: mobile,
      is_default: 1,
    };

    if (this.data.pIndex > 0) {
      console.log(this.data.provinces[this.data.pIndex]);
      postData.province_name = this.data.provinces[this.data.pIndex].name;
      postData.province_id = this.data.provinces[this.data.pIndex].id;
    }
    if (this.data.cIndex > 0) {
      postData.city_name = this.data.cities[this.data.cIndex].name;
      postData.city_id = this.data.cities[this.data.cIndex].id;
    }
    if (this.data.aIndex > 0) {
      postData.area_name = this.data.areas[this.data.aIndex].name;
      postData.area_id = this.data.areas[this.data.aIndex].id;
    }

    if (this.data.id) {
      postData.address_id = this.data.id;
    }

    const apiResult = await saveAddress(postData);

    if (apiResult.code != 200) {
      // 登录错误
      wx.hideLoading();
      wx.showToast({
        title: apiResult.meg,
        icon: "none",
      });
      return;
    } else {
      wx.navigateBack();
    }
  },
  async onLoad(e) {
    // this.initFromClipboard(
    //   "广州市天河区天河东路6号粤电广场北塔2302，徐小姐，18588998859"
    // );
    const _this = this;
    if (e.id) {
      // 修改初始化数据库数据
      const res = await getAddressInfo({
        token: wx.getStorageSync("token"),
        address_id: e.id,
      });

      if (res.code == 200) {
        this.setData({
          id: e.id,
          linkMan: res.data.name,
          address: res.data.address,
          mobile: res.data.telephone,
        });
        this.provinces(
          res.data.province_id,
          res.data.city_id,
          res.data.area_id
        );
      } else {
        wx.showModal({
          title: "错误",
          content: "无法获取快递地址数据",
          showCancel: false,
        });
      }
    } else {
      this.provinces();
      wx.getClipboardData({
        success(res) {
          if (res.data) {
            _this.initFromClipboard(res.data);
          }
        },
      });
    }
  },
  async initFromClipboard(str) {
    address_parse.smart(str).then((res) => {
      if (res.name && res.phone && res.address) {
        // 检测到收货地址
        this.setData({
          addressData: {
            provinceId: res.provinceCode,
            cityId: res.cityCode,
            districtId: res.countyCode,
            linkMan: res.name,
            mobile: res.phone,
            address: res.address,
          },
          linkMan: res.name,
          mobile: res.phone,
          address: res.address,
        });
        this.provinces(res.provinceCode, res.cityCode, res.countyCode);
      }
    });
  },
  deleteAddress: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: "提示",
      content: "确定要删除该收货地址吗？",
      success: function (res) {
        if (res.confirm) {
          delAddress({
            token: wx.getStorageSync("token"),
            address_id: id,
          }).then(function () {
            wx.navigateBack({});
          });
        } else {
          console.log("用户点击取消");
        }
      },
    });
  },
  async readFromWx() {
    let that = this;
    wx.chooseAddress({
      success: function (res) {
        // res = {
        //   cityName: '上海市',
        //   countyName: '嘉定区',
        //   detailInfo: '惠民路123号',
        //   errMsg: 'chooseAddress.ok',
        //   nationalCode: '310114',
        //   postalCode: '201800',
        //   provinceName: '上海市',
        //   telNumber: '13500000000',
        //   userName: '测试',
        // }
        const provinceName = res.provinceName;
        const cityName = res.cityName;
        const diatrictName = res.countyName;
        // 读取省
        const pIndex = that.data.provinces.findIndex((ele) => {
          return ele.name == provinceName;
        });
        if (pIndex != -1) {
          const e = {
            detail: {
              value: pIndex,
            },
          };
          that.provinceChange(e, 0, 0).then(() => {
            // 读取市
            let cIndex = that.data.cities.findIndex((ele) => {
              return ele.name == cityName;
            });
            if (cIndex == -1) {
              cIndex = 1; // 兼容直辖市
            }
            if (cIndex != -1) {
              const e = {
                detail: {
                  value: cIndex,
                },
              };
              that.cityChange(e, 0).then(() => {
                // 读取区县
                const aIndex = that.data.areas.findIndex((ele) => {
                  return ele.name == diatrictName;
                });
                if (aIndex != -1) {
                  const e = {
                    detail: {
                      value: aIndex,
                    },
                  };
                  that.areaChange(e);
                }
              });
            }
          });
        }
        that.setData({
          linkMan: res.userName,
          mobile: res.telNumber,
          address: res.detailInfo,
        });
      },
    });
  },
});
