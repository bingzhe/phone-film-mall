const wxpay = require("../../utils/pay.js");
const WXAPI = require("apifm-wxapi");
const AUTH = require("../../utils/auth");

import { getOrderList, quxiaoOrder, goodsOrderPay } from "../../api/api.js";
import { BASE_URL } from "../../api/config.js";

Page({
  data: {
    page: 1,
    tabIndex: 0,
    statusType: [
      {
        status: 9999,
        label: "全部",
      },
      {
        status: 0,
        label: "待付款",
      },
      {
        status: 1,
        label: "待确认",
      },
      {
        status: 2,
        label: "待发货",
      },
      {
        status: 3,
        label: "待收货",
      },
      {
        status: 4,
        label: "已完成",
      },
    ],
    status: 9999,
    hasRefund: false,
    badges: [0, 0, 0, 0, 0],

    paywaySelectShow: false,
    payway: "2",
    order_no: "",
  },
  statusTap: function (e) {
    const index = e.detail.index;
    const status = this.data.statusType[index].status;
    this.setData({
      page: 1,
      status,
    });
    this.orderList();
  },
  cancelOrderTap: function (e) {
    const that = this;
    const orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: "确定要取消该订单吗？",
      content: "",
      success: function (res) {
        if (res.confirm) {
          quxiaoOrder({
            token: wx.getStorageSync("token"),
            order_id: orderId,
          }).then(() => {
            that.data.page = 1;
            that.orderList();
          });
        }
      },
    });
  },
  refundApply(e) {
    // 申请售后
    const orderId = e.currentTarget.dataset.id;
    const amount = e.currentTarget.dataset.amount;
    wx.navigateTo({
      url: "/pages/order/refundApply?id=" + orderId + "&amount=" + amount,
    });
  },
  toPayTap: function (e) {
    // 防止连续点击--开始
    if (this.data.payButtonClicked) {
      wx.showToast({
        title: "休息一下~",
        icon: "none",
      });
      return;
    }
    this.data.payButtonClicked = true;
    setTimeout(() => {
      this.data.payButtonClicked = false;
    }, 2000); // 可自行修改时间间隔（目前是3秒内只能点击一次支付按钮）
    // 防止连续点击--结束
    // const that = this;
    const order_no = e.currentTarget.dataset.id;

    this.setData({
      order_no,
      paywaySelectShow: true,
    });

    // let money = e.currentTarget.dataset.money;
    // const needScore = e.currentTarget.dataset.score;
    // WXAPI.userAmount(wx.getStorageSync("token")).then(function (res) {
    //   if (res.code == 0) {
    //     const order_pay_user_balance = wx.getStorageSync(
    //       "order_pay_user_balance"
    //     );
    //     if (order_pay_user_balance != "1") {
    //       res.data.balance = 0;
    //     }
    //     // 增加提示框
    //     if (res.data.score < needScore) {
    //       wx.showToast({
    //         title: "您的积分不足，无法支付",
    //         icon: "none",
    //       });
    //       return;
    //     }
    //     let _msg = "订单金额: " + money + " 元";
    //     if (res.data.balance > 0) {
    //       _msg += ",可用余额为 " + res.data.balance + " 元";
    //       if (money - res.data.balance > 0) {
    //         _msg +=
    //           ",仍需微信支付 " + (money - res.data.balance).toFixed(2) + " 元";
    //       }
    //     }
    //     if (needScore > 0) {
    //       _msg += ",并扣除 " + needScore + " 积分";
    //     }
    //     money = money - res.data.balance;
    //     wx.showModal({
    //       title: "请确认支付",
    //       content: _msg,
    //       confirmText: "确认支付",
    //       cancelText: "取消支付",
    //       success: function (res) {
    //         console.log(res);
    //         if (res.confirm) {
    //           that._toPayTap(orderId, money);
    //         } else {
    //           console.log("用户点击取消支付");
    //         }
    //       },
    //     });
    //   } else {
    //     wx.showModal({
    //       title: "错误",
    //       content: "无法获取用户资金信息",
    //       showCancel: false,
    //     });
    //   }
    // });
  },
  async wxSphGetpaymentparams(e) {
    const orderId = e.currentTarget.dataset.id;
    const res = await WXAPI.wxSphGetpaymentparams(
      wx.getStorageSync("token"),
      orderId
    );
    if (res.code != 0) {
      wx.showToast({
        title: res.msg,
        icon: "none",
      });
      return;
    }
    // 发起支付
    wx.requestPayment({
      timeStamp: res.data.timeStamp,
      nonceStr: res.data.nonceStr,
      package: res.data.package,
      signType: res.data.signType,
      paySign: res.data.paySign,
      fail: (aaa) => {
        console.error(aaa);
        wx.showToast({
          title: "支付失败:" + aaa,
        });
      },
      success: () => {
        // 提示支付成功
        wx.showToast({
          title: "支付成功",
        });
        this.orderList();
      },
    });
  },
  _toPayTap: function (orderId, money) {
    const _this = this;
    if (money <= 0) {
      // 直接使用余额支付
      WXAPI.orderPay(wx.getStorageSync("token"), orderId).then(function (res) {
        _this.data.page = 1;
        _this.orderList();
      });
    } else {
      wxpay.wxpay("order", money, orderId, "/pages/order-list/index");
    }
  },
  onLoad: function (options) {
    if (options && options.type) {
      if (options.type == 99) {
        this.setData({
          hasRefund: true,
        });
      } else {
        const tabIndex = this.data.statusType.findIndex((ele) => {
          return ele.status == options.type;
        });
        this.setData({
          status: options.type,
          tabIndex,
        });
      }
    }
    this.orderList();
    this.setData({
      sphpay_open: wx.getStorageSync("sphpay_open"),
    });
  },
  onReady: function () {
    // 生命周期函数--监听页面初次渲染完成
  },
  onShow: function () {},
  onPullDownRefresh: function () {
    this.data.page = 1;
    this.orderList();
    wx.stopPullDownRefresh();
  },
  onReachBottom() {
    this.setData({
      page: this.data.page + 1,
    });
    this.orderList();
  },
  async orderList() {
    wx.showLoading({
      title: "",
    });
    var postData = {
      page: this.data.page,
      pageSize: 20,
      token: wx.getStorageSync("token"),
    };

    if (this.data.status != 9999) {
      postData.status = this.data.status;
    }
    const res = await getOrderList(postData);
    wx.hideLoading();

    res.data.forEach((item) => {
      item.statusStr = this.statusToStr(item.status);

      item.goods_list.forEach((goods) => {
        goods.pic_url = `${BASE_URL}${goods.goods_img}`;
      });
    });

    console.log(res.data);

    this.setData({
      orderList: res.data,
    });
  },
  statusToStr(statu) {
    if (statu == 0) {
      return "待付款";
    } else if (statu == 1) {
      return "待确认";
    } else if (statu == 2) {
      return "待发货";
    } else if (statu == 3) {
      return "待收货";
    } else if (statu == 4) {
      return "已完成";
    }
  },
  onPaywayChange(e) {
    this.setData({
      payway: e.detail,
    });
  },

  paywaySelectCancel() {
    this.setData({
      paywaySelectShow: false,
    });
  },

  async paywaySelectConfirm() {
    const params = {
      token: wx.getStorageSync("token"),
      order_no: this.data.order_no,
      pay_type: this.data.payway,
    };

    const result = await goodsOrderPay(params);

    console.log("paywaySelectConfirm", result);
    this.paywaySelectCancel();

    if (this.data.payway == "1") {
      wx.showToast({
        title: "支付成功",
      });

      this.orderList();
    } else if (this.data.payway == "2") {
      console.log("调微信支付");
      const res = JSON.parse(result.data);
      const that = this;
      // 发起支付
      wx.requestPayment({
        timeStamp: res.timeStamp,
        nonceStr: res.nonceStr,
        package: res.package,
        signType: res.signType,
        paySign: res.paySign,
        fail: function (err) {
          console.error(err);
          wx.showToast({
            title: "支付失败:" + err,
          });
        },
        success: function () {
          // 提示支付成功
          wx.showToast({
            title: "支付成功",
          });
          that.orderList();
        },
      });
    }
  },
});
