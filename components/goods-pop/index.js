import { getGoodsInfo, createCartBatch } from "../../api/api.js";

Component({
  behaviors: [],
  options: {
    addGlobalClass: true,
  },
  /**
   * 组件的对外属性，是属性名到属性设置的映射表
   */
  properties: {
    skuCurGoodsBaseInfo: null,
  },

  /**
   * 组件的内部数据，和 properties 一同用于组件的模板渲染
   */
  data: {
    skuCurGoodsShow: false,
    skuCurGoods: undefined,

    buyNumber: 0,
    buyNumMin: 0,
    buyNumMax: 0,
  },
  // 组件数据字段监听器，用于监听 properties 和 data 的变化
  observers: {
    'skuCurGoodsBaseInfo': function (skuCurGoodsBaseInfo) {
      console.log('observers-skuCurGoodsBaseInfo', skuCurGoodsBaseInfo)
      if (!skuCurGoodsBaseInfo) {
        return
      }

      this.initGoodsData(skuCurGoodsBaseInfo)
    }
  },
  lifetimes: {
    attached: function () {
      console.log('11', this.data.skuCurGoods);
    },
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
    },
  },
  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function () {
      console.log('22', this.data.skuCurGoods);
    },
    hide: function () { },
    resize: function () { },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    closeSku() {
      // 关闭弹窗
      this.setData({
        skuCurGoodsShow: false
      })
      // wx.showTabBar()
    },
    async initGoodsData(skuCurGoodsBaseInfo) {
      this.setData({
        skuCurGoods: skuCurGoodsBaseInfo,
        skuCurGoodsShow: true,
        buyNumMax: skuCurGoodsBaseInfo.stock
      })
    },
    stepChange(event) {
      //更新spec_list
      // this.data.goodsDetail.spec_list[this.data.specSelectIndex].cart_num =
      //   event.detail;

      this.setData({
        buyNumber: event.detail,
        // goodsDetail: this.data.goodsDetail,
      });
    },
    async addCarSku() {

      if (this.data.buyNumber === 0) {
        wx.showToast({
          title: "请添加数量",
          icon: "none",
        });

        return;
      }


      const cart_list = [
        {
          goods_num: this.data.buyNumber,
          goods_id: this.data.skuCurGoods.goods_id,
        },
      ];

      const params = {
        token: wx.getStorageSync("token"),
        cart_list: JSON.stringify(cart_list),
      };

      const result = await createCartBatch(params);

      wx.showToast({
        title: "加入购物车成功",
        icon: "success",
      });

      this.setData({
        skuCurGoodsShow: false,
        buyNumber: 0,
        buyNumMin: 0,
        buyNumMax: 0,
      })
    },
  }
})