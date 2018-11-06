var app = getApp();
Page({
  data: {
    selectAllStatus: false,
    money: '',
    payOptions: '',
  },
  bindKeyInput(e) {
    this.setData({
      money: e.detail.value
    })
  },
  selectAll() {
    let selectAllStatus = this.data.selectAllStatus;
    selectAllStatus = !selectAllStatus;
    this.setData({
      selectAllStatus: selectAllStatus
    })
  },
  recharge() {
    let that = this;
    let selectAllStatus = that.data.selectAllStatus;
    let money = that.data.money;
    if (selectAllStatus) {
      if (money == '' || parseInt(money) < 200) {
        wx.showToast({
          title: '充值金额不能小于200',
          icon: 'none',
          duration: 1200
        })
      } else {
        let userInfo = JSON.parse(wx.getStorageSync('userInfo'))
        let params = {
          openId: that.data.openId,
          payAmount: parseInt(money),
          orderType: '1',
          payType: '09',
          payWay: '01',
          reqType: '4',
          token: app.util.token
        }
        app.http.post_from('pay/jyPay', params).then(res => { //调用充值接口
          this.openWxpay(res.data)
        }).catch(e => {
          console.log(e);
        })
      }
    } else {
      wx.showToast({
        title: '请先阅读充值协议',
        icon: 'none',
        duration: 1200
      })
    }
  },
  openWxpay(payInfo) { //唤起微信支付
    var that = this;
    let params = {
      success(o) {
       wx.showModal({
         title: '提示',
         content: '充值成功！',
         showCancel:false,
       })
       wx.navigateTo({
         url: '/pages/mine/index',
       })
      },
      fail(o) {
        wx.showModal({
          title: '提示',
          content: '支付失败',
          showCancel: false,
        })
      },
      complete(o) {
        console.log(o)
      },
    }
    if (!payInfo.paySign) { //随便拿个字段来判断成功失败
      console.log('error', payInfo)
      wx.showModal({
        title: '提示',
        content: payInfo.respMsg,
        showCancel: false,
      })
      return;
    }

    payInfo = Object.assign(params, payInfo);
    console.log('payInfo', payInfo);
    wx.requestPayment(payInfo)

  },
  agreement() {
    wx.navigateTo({
      url: '/pages/agreement/agreement'
    })
  },
  onShow() {
    var that = this
    wx.login({
      success(o) {
        let url = 'basics/anon/spgWxAuth'
        let params = {
          code: o.code
        }
        
        app.http.post_from(url, params).then(o => {
          if (o.data.res_code == 0) {
            that.data.openId = o.data.res_data.openId
          }
        }).catch(e => {
            
        })
      }
  })
}
})