import http from './api/http-request.js'
import util from './api/util.js'
App({
  globalData: {
    comTel: '4006199669',
    sele: true,//红云积分
  },
  serviceFun() {//客服
    let comTel = this.globalData.comTel;
    // console.log(comTel)
    wx.makePhoneCall({
      phoneNumber: comTel
    })
  },
  onShow(options) {
    // console.log('app.js',options)
    if (options.query.memberId) {
      wx.setStorageSync('memberId', options.query.memberId)//拼团砍价等活动分享出去，返回时带的推广人ID
    }
  },

  http:http,
  util:util
});
