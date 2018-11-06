var app = getApp()
Page({
  data: {
    sele: app.globalData.sele,
    res_data: {},
  },
  onLoad: function (options) {
    console.log('呵呵呵',options)
    this.setData({
      sele: app.globalData.sele
    })
    if (app.globalData.sele){
      this.redIntegral();
    }else{
      this.cloudIntegral();
    }
  },
  takeMoney(){
    wx.navigateTo({
      url: '/pages/integralWay/index',
    })
  },
  redIntegral(){  //红积分
    let that = this;
    let parameter = {
      token: app.util.token
    };
    app.http.post_from('member/getMemberRedPointInfo', parameter).then(res => { //获取商品分类列表
      let res_data = res.data.res_data;
      res_data.redPoint = app.util.strings(res_data.redPoint);//可提现
      res_data.redPointAlreadyPresente = app.util.strings(res_data.redPointAlreadyPresente);//已提现
      res_data.redPointToBeConfirmed = app.util.strings(res_data.redPointToBeConfirmed);//待确认
      res_data.redPonitIncome = app.util.strings(res_data.redPonitIncome);//累计收入
      res_data.redPonitWithdrawals = app.util.strings(res_data.redPonitWithdrawals);//提现中

      that.setData({
        res_data: res_data
      })
    }).catch(e => {
      console.log(e);
    })
  },
  cloudIntegral() { //云积分
    let that = this;
    let parameter = {
      token: app.util.token
    };
    app.http.post_from('member/getMemberCloudPointInfo', parameter).then(res => { //获取商品分类列表
      let res_data = res.data.res_data;
      console.log('云积分',res_data)
      res_data.redPoint = app.util.strings(res_data.cloudPoint);//当前可用
      res_data.redPonitIncome = app.util.strings(res_data.cloudPointUnconfirmed);//待确认
      res_data.redPointToBeConfirmed = app.util.strings(res_data.gainCloudPoint);//累计收入

      console.log(res_data)
      that.setData({
        res_data: res_data
      })
    }).catch(e => {
      console.log(e);
    })
  },
  integralClick() {
    app.globalData.sele = true;
    this.setData({
      sele: app.globalData.sele
    })
    this.redIntegral();
  },
  integralClick2() {
    app.globalData.sele = false;
    this.setData({
      sele: app.globalData.sele
    })
    this.cloudIntegral();
  },
})