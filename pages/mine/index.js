var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },
  onShow(){
    let token = app.util.token
    if (!token) {//如果没有userInfo，跳到授权登录页
      wx.navigateTo({
        url: '../phoneSign/phoneSign?my=0'
      })
    } else {
      this.getMember()
      
    }
  },
  serviceFun() {
    app.serviceFun();
  },
  getMember(){
    let params = {
      token:app.util.token
    }
    let url = '/member/jifenyuetongji'
    app.http.post_from(url,params).then(o=>{  
      if (o.data.res_code != 0) {//登录过期或者某种原因导致登录失败
        wx.navigateTo({
          url: '/pages/phoneSign/phoneSign',
        })
        return;
      }
      let userInfo = o.data.res_data.member;
      app.util.userInfo = userInfo;
      wx.setStorageSync('userInfo', JSON.stringify(userInfo))
      this.setData({
        userInfo
      })
    })
  },
  showOrderList() {
    wx.navigateTo({
      url: '../orderlist/index'
    })
  },
  showMyGroup() {
    wx.navigateTo({
      url: '../mygroup/index'
    })
  },
  showRightOrderList() {
    wx.navigateTo({
      url: '../rightOrderList/index'
    })
  },
  showGoldOrderList() {
    wx.navigateTo({
      url: '../goldOrderList/index'
    })
  },
  cutprice() {
    wx.navigateTo({
      url: '/pages/cutprice/cutprice'
    })
  },
  couponFun(){
    wx.navigateTo({
      url: '/pages/myCoupon/myCoupon'
    })
  },
  redcloud(e) {
    let idx = e.currentTarget.dataset.idx;
    if (idx == 0) {
      app.globalData.sele = true;
    } else {
      app.globalData.sele = false;
    }
    wx.navigateTo({
      url: '/pages/redcloud/redcloud'
    })
  },
  goldDetailed() {
    wx.navigateTo({
      url: '/pages/goldDetailed/goldDetailed'
    })
  },
  sharePoster() {
    wx.navigateTo({
      url: '/pages/poster/poster'
    })
  },
  invitation() {
    wx.navigateTo({
      url: '/pages/invitation/invitation'
    })
  },
  collection() {
    wx.navigateTo({
      url: '/pages/collection/collection'
    })
  },
  bankCard() {
    wx.navigateTo({
      url: '/pages/bankCard/bankCard'
    })
  },
  about() {
    wx.navigateTo({
      url: '/pages/about/about'
    })
  },
  shopowner() {
    wx.navigateTo({
      url: '/pages/shopowner/shopowner'
    })
  },
  setUpFun(){
    wx.navigateTo({
      url: '/pages/setUp/setUp'
    })
  },
  recharge(){
    wx.navigateTo({
      url: '/pages/recharge/recharge'
    })
  },
  address(){
    wx.navigateTo({
      url: '/pages/address/index'
    })
  },
  face(){
    wx.navigateTo({
      url: '/pages/personalInformation/personalInformation'
    })  
  },
  shopBoxFun(e){
    let idx = e.currentTarget.dataset.idx;
    if(idx==0){
      wx.navigateTo({
        url: '/pages/invitation/invitation'
      }) 
    } else if (idx == 1) {
      wx.navigateTo({
        url: '/pages/myGoods/myGoods'
      }) 
    } else if (idx == 2) {
      wx.navigateTo({
        url: '/pages/myCustomer/myCustomer'
      })
      // wx.navigateTo({
      //   url: '/pages/personalInformation/personalInformation'
      // }) 
    } else if (idx == 3) {
      wx.navigateTo({
        url: '/pages/bankCard/bankCard'
      }) 
    }

     
    
  }

})