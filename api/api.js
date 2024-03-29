import { request, uploadFile } from "./request";

// 数据字典
const getDictItemsApi = (code) =>
  request(`/sys/dict/getDictItems/${code}`, {}, "GET");

// 登录
const loginApi = (params) => request("/sys/wxLogin", params, "POST");
const loginCheckApi = (params) => request("/sys/wxLoginCheck", params, "POST");
const getOpenid = (params) => request("/Wxlogin/getOpenid", params, "POST");

// 退出登录
const logoutApi = (params) => request("/sys/logout", params, "POST");

// 分类列表
const getCateList = (params) => request("/Goods/getCateList", params, "POST");
// 商品列表
const getGoodsList = (params) => request("/Goods/getGoodsList", params, "POST");
// 商品详情
const getGoodsInfo = (params) => request("/Goods/getGoodsInfo", params, "POST");
// 用户信息
const getUsersinfo = (params) => request("/Usersinfo/index", params, "POST");
// 保存手机号
const savePhone = (params) => request("/WxLogin/savePhone", params, "POST");
// 首页推荐商品
const getGoodsIndex = (params) => request("/Goods/index", params, "POST");
// 首页banner
const getBanner = (params) => request("/Index/getBanner", params, "POST");
// 资讯列表
const getAnnouncement = (params) =>
  request("/Index/getAnnouncement", params, "POST");
// 获取客服
const getKefu = (params) => request("/index/getKefu", params, "POST");

// 获取用户默认地址
const getDefaultAddress = (params) =>
  request("/Usersinfo/getDefaultAddress", params, "POST");
// 用户地址列表
const getAddress = (params) => request("/Usersinfo/getAddress", params, "POST");
// 用户地址详情
const getAddressInfo = (params) =>
  request("/Usersinfo/getAddressInfo", params, "POST");
// 用户保存地址
const saveAddress = (params) =>
  request("/Usersinfo/saveAddress", params, "POST");
// 用户删除地址
const delAddress = (params) => request("/Usersinfo/delAddress", params, "POST");

// 加购物车
const createCart = (params) => request("/Order/CreateCart", params, "POST");
// 批量加入购物车
const createCartBatch = (params) =>
  request("/Order/CreateCartBatch", params, "POST");
// 删除购物
const delCart = (params) => request("/Order/DelCart", params, "POST");
// 购物车列表
const getCartList = (params) => request("/Order/GetCartList", params, "POST");
// 创建订单
const createOrder = (params) => request("/Order/CreateOrder", params, "POST");
// 订单列表
const getOrderList = (params) => request("/Order/GetOrderList", params, "POST");
// 订单详情
const getOrderInfo = (params) => request("/Order/GetOrderInfo", params, "POST");
// 订单支付
const goodsOrderPay = (params) =>
  request("/OrderPay/goodsOrderPay", params, "POST");
// 未支付订单取消订单
const quxiaoOrder = (params) => request("/Order/QuxiaoOrder", params, "POST");
// 订单收货
const receiptOrder = (params) => request("/Usersinfo/receipt", params, "POST");
// 用户修改名称
const saveUsername = (params) =>
  request("/Usersinfo/saveUsername", params, "POST");

// --文件上传--
// 文件上传
const fileCommonUpload = (filePath) => uploadFile("/Upload/index", filePath);

module.exports = {
  loginApi,
  loginCheckApi,
  getOpenid,
  logoutApi,
  getDictItemsApi,
  getCateList,
  getGoodsList,
  getGoodsIndex,
  getBanner,
  getAnnouncement,
  getGoodsInfo,
  getUsersinfo,
  savePhone,
  getDefaultAddress,
  getAddress,
  getAddressInfo,
  saveAddress,
  delAddress,
  createCart,
  createCartBatch,
  delCart,
  getCartList,
  createOrder,
  getOrderList,
  getOrderInfo,
  goodsOrderPay,
  fileCommonUpload,
  quxiaoOrder,
  receiptOrder,
  saveUsername,
  getKefu,
};
