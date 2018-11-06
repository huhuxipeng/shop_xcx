import upng from '../../static/js/upng.js'
var app = getApp()
Page({
  data: {
    nickname: '',
    tempFilePaths: '',
    canvasWidth: 224,
    canvasHeight: 224,
  },
  onLoad: function (options) {
    let that = this;
    let parameter = {
      token: app.util.token,
    }
    app.http.post_from('member/jifenyuetongji', parameter).then(res => {
      let member = res.data.res_data.member;
      if (member.face == '' || member.face == undefined){
        that.setData({
          member: member,
          tempFilePaths: '/static/images/default.png'
        })
      }else{
        that.setData({
          member: member,
          tempFilePaths: member.face
        })
      }
    }).catch(e => {
      console.log(e);
    })
  },
  onShow(){
    if(this.data.noFirst){
      let member = JSON.parse(wx.getStorageSync('userInfo'));
      this.setData({
        member: member,
        tempFilePaths: member.face
      })
    }else{
      this.data.noFirst = true;
    }
  },
  nickname(e){
    let nickname = e.detail.value;
    this.setData({
      nickname: nickname
    })
  },
  confirm() {//确认
    let that = this;
    let nickname = this.data.nickname;
    if (nickname==''){
      wx.showToast({
        title: '昵称不能为空',
        icon: 'none'
      })
    }else{
      let parameter = {
        token: app.util.token,
        nickname
      }
      app.http.post_from('member/updateMemberInfo', parameter).then(res => {
        if(res.data.res_code==0){
          wx.showToast({
            title: '昵称修改成功',
            icon: 'success'
          })
        }
      }).catch(e => {
        console.log(e);
      })
    }
  },
  signOut(){//切换账号
    wx.navigateTo({
      url: '/pages/phoneSign/phoneSign',
    })
  },
  chooseimage() {
    var that = this;
    wx.chooseImage({
      count: 1, // 默认9  
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有  
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有  
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        let temp = res.tempFilePaths;  
        that.drawCanvas(temp,0)
      }
    })
  },
  drawCanvas(temp,index){
    if (index == temp.length) {
      return;
    }
    var that = this;
    const platform = wx.getSystemInfoSync().platform
    const ctx = wx.createCanvasContext('attendCanvasId');
    wx.getImageInfo({
      src: temp[index],
      success: function (a) {
        let width = 112;
        let height = 112;
        that.setData({
          canvasWidth: width + 'px',
          canvasHeight: height + 'px',
        })
        ctx.drawImage(temp[index], 0, 0, width, height);
        ctx.draw(false, o => {
          wx.canvasGetImageData({
            canvasId: 'attendCanvasId',
            x: 0,
            y: 0,
            width: width,
            height: height,
            success: function success(res) {
              if (platform === 'ios') {
                // 兼容处理：ios获取的图片上下颠倒 
                res = that.reverseImgData(res)
              } 
              //png编码
              let pngData = upng.encode([res.data.buffer], res.width, res.height)
              // 4. base64编码
              let base64 = wx.arrayBufferToBase64(pngData)

              let url = 'member/anon/base64UploadImg'
              let params = {
                data: base64,
                type: 8, // 8-头像图片上传 9-评价图片上传
              }
              app.http.post_from(url, params).then(o => {
                let that2 = that;
                let filePath = o.data.data.filePath;

                let parameter = {
                  face: filePath,
                  token: app.util.token,
                }
                app.http.post_from('member/updateMemberInfo', parameter).then(res => {
                  if (res.data.res_code == 0) {
                    wx.showToast({
                      title: '头像修改成功',
                      icon: 'success'
                    })
                    that2.setData({
                      tempFilePaths: filePath
                    })
                  }
                }).catch(e => {
                  console.log(e);
                })
              })
            },
            fail(e) {
              console.log('e', e)
            }
          });
        });
      }
    })
  },
  //ios图片处理 
  reverseImgData(res) {
    var w = res.width
    var h = res.height
    let con = 0
    for (var i = 0; i < h / 2; i++) {
      for (var j = 0; j < w * 4; j++) {
        con = res.data[i * w * 4 + j]
        res.data[i * w * 4 + j] = res.data[(h - i - 1) * w * 4 + j]
        res.data[(h - i - 1) * w * 4 + j] = con
      }
    }
    return res
  }
})