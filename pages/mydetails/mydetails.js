var app = getApp()
Page({
  data: {
    activity: false,
    id:'l'
  },
  onLoad(options) {
    let cpnId = options.cpnId;
    this.setData({
      cpnId: cpnId,
      cpnIds: cpnId,
      tabIndex: options.tabIndex,
    })
    let parameter = {
      cpnId: cpnId,
      token: app.util.token
    }
    app.http.post_from('coupon/couponDetail', parameter).then(res => {
      let coupon = res.data.res_data.coupon;
      coupon.useBeginTime = new Date(coupon.useBeginTime).format("yyyy.MM.dd");
      coupon.useEndTime = new Date(coupon.useEndTime).format("yyyy.MM.dd");
      coupon.shareImg = app.util.formatImg(coupon.shareImg);
      coupon.relType = coupon.relType1;
      switch (coupon.cpnType) {
        case 0:
          coupon.cpnTypes = '分类券'
          break;
        case 1:
          coupon.cpnTypes = '商品券'
          break;
        case 2:
          coupon.cpnTypes = '店铺券'
          break;
        case 3:
          coupon.cpnTypes = '通用券'
          break;
      }
      this.setData({
        o_coupon: coupon
      })
    })
  },
  btnFun() {
    if (this.data.tabIndex == 1) {
      wx.showToast({
        title: '已使用',
        icon: 'none',
        duration: 1000
      })
    } else if (this.data.tabIndex == 2) {
      wx.showToast({
        title: '已过期',
        icon: 'none',
        duration: 1000
      })
    } else {
      wx.showToast({
        title: '平台（商户）惠赠不支持分享领取',
        icon: 'none',
        duration: 800
      })
    }
  },
  onShareAppMessage: function (e) { //数据分享
    if (e.target != undefined) {
      this.setData({
        id: e.target.dataset.id
      })
    }
    let [o_coupon, id, cpnId] = [this.data.o_coupon, this.data.id, this.data.cpnIds]
    let path;
    if (id=='z'){//赠送
      let sn = o_coupon.sn;
      path = '/pages/collarVoucher/collarVoucher?sn=' +sn + '&cpnId=' + cpnId + '&o_coupon_cpnId=' + o_coupon.cpnId + '&mold=2'
    } else {//普通领取
      path = '/pages/collarVoucher/collarVoucher?cpnId=' + o_coupon.cpnId + '&o_coupon_cpnId=' + o_coupon.cpnId +'&mold=0'
    }
    console.log('地址',path)
    return {
      title: o_coupon.shareTitle,
      desc: o_coupon.shareRemark,
      path: path,
      imageUrl: o_coupon.shareImg,
      success: (res) => {
        console.log("转发成功", res);
      },
      fail: (res) => {
        console.log("转发失败", res);
      }
    }
  },
  useFun() {
    //跳转到对应的使用券页面
    console.log(this.data.o_coupon)
    app.util.showRelDetail(this.data.o_coupon);
  },
  ruleFun() {
    this.setData({
      activity: true
    })
  },
  icon5Fun() {
    this.setData({
      activity: false
    })
  }
})