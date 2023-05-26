// 每次修改 1. appid 2.title 3.url 4.后台添加调用的https 5.分享标题修改
const rootUrl = "https://kamoniu.shouchuangtx.cn"; // 歌宸型号搜索 (歌宸型号搜索) wx9441a66206aaa235

import { request } from "./request";

const getCateListApi = () => {
  return request(`/Goods/getCateList`, {}, "get");
};
const getGoodsListApi = (data) => {
  return request(`/Goods/getGoodsList`, data, "post");
};

const getGoodsListPageApi = (data) => {
  return request(`/Goods/getGoodsList4`, data, "post");
};

const getNewProductApi = () => {
  return request(`/index/getNewProduct`, {}, "get");
};
// 查找有商品的分类，没有返回默认的第一个
const getGoodsCateApi = (data) => {
  return request(`/Goods/getGoodsCate`, data, "post");
};

const getBannerListApi = () => {
  return request(`/Index/getBanner`, {}, "get");
};
const getPhoneNameApi = (data) => {
  return request(`/Index/getPhoneName`, data, "post");
};

const getNameListApi = (data) => {
  return request(`/Goods/getNameList`, data, "post");
};

const getAnnouncementApi = (data) => {
  return request(`/Index/getAnnouncement`, data, "post");
};

const getVideoListApi = (data) => {
  return request(`/Index/getVideo`, data, "post");
};

const saveFeedbackApi = (data) => {
  return request(`/Index/saveFeedback`, data, "post");
};
module.exports = {
  rootUrl,
  getCateListApi,
  getGoodsListApi,
  getGoodsListPageApi,
  getNewProductApi,
  getBannerListApi,
  getPhoneNameApi,
  getGoodsCateApi,
  getNameListApi,
  getAnnouncementApi,
  getVideoListApi,
  saveFeedbackApi,
};
