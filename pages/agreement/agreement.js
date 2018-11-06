var app = getApp();
Page({

  data: {
  
  },
  recharge(){
    let pages = getCurrentPages(); //页面数组
    let prevPage = pages[pages.length - 2]; //上一页面
    prevPage.setData({
      selectAllStatus: true
    })
    wx.navigateBack()
  }
})