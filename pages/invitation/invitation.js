var app = getApp()
Page({
  data: {
    imgPath:'',
  },
  onLoad: function (options) {
    let that = this; 
    let parameter = {
      token : app.util.token
    };
    app.http.post_from('/member/getMemberTwoCodeImg', parameter).then(res => {
      let imgPath = res.data.res_data.imgPath;
      that.setData({
        imgPath: imgPath
      })
    }).catch(e => {
      console.log(e);
    })
  },
  onShareAppMessage: function () { //数据分享
    let option = {
      orderId: this.data.orderid,
      token: this.data.token ? this.data.token : app.util.token
    }
    return app.util.share('精品优选', option)
  },
})