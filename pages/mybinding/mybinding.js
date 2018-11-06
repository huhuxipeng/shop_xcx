var app = getApp()
Page({
  data: {

  },
  codeFun(e) {
    this.setData({
      code: e.detail.value
    })
  },
  receiveFun() {
    let [code] = [this.data.code];
    if(code==''){
      wx.showToast({
        title: '请输入优惠码',
        icon: 'none'
      })
    } else {
      console.log(this.data.code)
      let parameter={
        sn: code,
        token: app.util.token
      }
      app.http.post_from('coupon/underGetCoupon', parameter).then(res => {
        console.log(res)
        if(res.data.res_code==0){
          wx.showToast({
            title: res.data.res_info,
          })
        }else{
          wx.showToast({
            title: res.data.res_info,
            icon: 'none'
          })
        }
      })

    }
  }
})