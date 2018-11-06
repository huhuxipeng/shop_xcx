var app = getApp()
const ctx = wx.createCanvasContext('myCanvas')
Page({
  data: {
    know: true,
    imgIndex: 0,
    imgObj: [],
    grant: false,
  },
  onShow() {
    this.getList();
  },
  getList() {
    let url = 'member/getPosterList'
    let params = {
      token: app.util.token
    }
    app.http.post_from(url, params).then(o => {
      console.log('o', o)
      this.setData({
        imgObj: o.data.res_data.posterList,
      })
    })
  },
  onSwip(e) {
    console.log(e)
    this.setData({
      imgIndex: e.detail.current
    })
  },


  
  preservation() { //生成图片方法
    let that = this;
    let img = that.data.imgObj[that.data.imgIndex].posterQrcodeImg;

    wx.getSetting({ //保存相册要授权
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              console.log('授权成功')
            }
          })
        }
      }
    })


    wx.downloadFile({
      url: img, //仅为示例，并非真实的资源that.data.imgObj[that.data.imgIndex].posterQrcodeImg
      success(res) {

        wx.saveImageToPhotosAlbum({ //保存生成的图片到手机相册里
          filePath: res.tempFilePath,
          success(res) {
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 2000
            })
          },
          fail(err) {
            that.setData({
              grant: true
            })
          }
        })

      }
    })

    
  },
  handler() {
    this.setData({
      grant: false
    })
  },
  know() {
    this.setData({
      know: false
    })
  },
  onShareAppMessage: function(e) { //数据分享
    return {
      title: this.data.imgObj[this.data.imgIndex].shareTitle,
      desc: this.data.imgObj[this.data.imgIndex].shareDescribe,
      path: '/pages/poster/poster',
      imageUrl: this.data.imgObj[this.data.imgIndex].posterQrcodeImg,
      success: (res) => {
        console.log("转发成功", res);
      },
      fail: (res) => {
        console.log("转发失败", res);
      }
    }
  },














})