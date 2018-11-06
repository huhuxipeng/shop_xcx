var app = getApp()
const ctx = wx.createCanvasContext('myCanvas')
Page({
  data: {
    deleteData: false,
    popup: '',
    popupState: false,
    mysrc: "https://jymall.oss-cn-beijing.aliyuncs.com/member/spreadgoods20180904/4fddf1e5-ffaa-4ea7-809e-d76deb21c9bf.jpg"
  },
  onShow() {
    let that = this;
    wx.downloadFile({
      url: that.data.mysrc, //仅为示例，并非真实的资源
      success(res) {
        that.data.mysrc = res.tempFilePath
      }
    })
    let parameter = {
      token: app.util.token
    };
    app.http.post_from('member/getMemberGoods', parameter).then(res => { //获取列表
      let memberGoods = res.data.res_data.memberGoods;
      for (let i = 0; i < memberGoods.length; i++) {
        memberGoods[i].deleteData = false
        memberGoods[i].price = app.util.strings(memberGoods[i].price);
        let element = memberGoods[i].image;
        let t = app.util.formatImg(element)
        memberGoods[i].image = t; //图片格式化

        if (memberGoods[i].qRCodePath.substr(0, 5) != 'https') {
          memberGoods[i].qRCodePath = '/static/images/default.png';
        }
      }
      that.setData({
        memberGoods: memberGoods
      })
    }).catch(e => {
      console.log(e);
    })
  },
  //手指触摸动作开始 记录起点X坐标
  touchstart: function(e) {
    this.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
    })
  },
  //滑动事件处理
  touchmove: function(e) {
    var that = this,
      index = e.currentTarget.dataset.idx, //当前索引
      startX = that.data.startX, //开始X坐标
      startY = that.data.startY, //开始Y坐标
      touchMoveX = e.changedTouches[0].clientX, //滑动变化坐标
      touchMoveY = e.changedTouches[0].clientY, //滑动变化坐标
      //获取滑动角度
      angle = that.angle({
        X: startX,
        Y: startY
      }, {
        X: touchMoveX,
        Y: touchMoveY
      });

    let deleteData = 'memberGoods[' + index + '].deleteData';

    //滑动超过30度角 return
    if (Math.abs(angle) > 30) {
      return;
    }
    if (touchMoveX > startX) {
      //右滑
      that.setData({
        [deleteData]: false
      })
    } else {
      //左滑
      that.setData({
        [deleteData]: true
      })
    }
  },
  /**
   * 计算滑动角度
   * @param {Object} start 起点坐标
   * @param {Object} end 终点坐标
   */
  angle: function(start, end) {
    var _X = end.X - start.X,
      _Y = end.Y - start.Y
    //返回角度 /Math.atan()返回数字的反正切值
    return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
  },
  del(e) {
    let that = this;
    let idx = e.currentTarget.dataset.idx;
    let goodsId = that.data.memberGoods[idx].goodsId;
    let parameter = {
      token: app.util.token,
      goodsId: goodsId
    };
    app.http.post_from('member/removeMemberGoods', parameter).then(res => { //获取列表
      console.log(res)
      that.onShow();
    }).catch(e => {
      console.log(e);
    })
  },
  ewm(e) {
    let that = this;
    let idx = e.currentTarget.dataset.idx;
    let memberGoods = that.data.memberGoods[idx];

    that.setData({
      popup: memberGoods,
      popupState: true
    })
    console.log(memberGoods)
    that.huatu(that.data.mysrc);
  },
  close() {
    this.setData({
      popupState: false
    })
  },
  huatu: function (qRCodePath) {
    ctx.clearRect(0, 0, 420, 420)
    //画图
    ctx.drawImage(qRCodePath, 0, 0, 200, 200)
    ctx.draw()
  },
  Okgenerate() { //生成图片方法
    var _this = this
    wx.canvasToTempFilePath({ //生成图片
      x: 0,
      y: 0,
      width: 200,
      height: 200,
      destWidth: 200,
      destHeight: 200,
      quality: 1,
      canvasId: 'myCanvas',
      success: function(res) {
        console.log(res.tempFilePath)
        wx.saveImageToPhotosAlbum({ //保存生成的图片到手机相册里
          filePath: res.tempFilePath,
          success(res) {
            wx.showToast({
              title: '保存相册成功',
            })
          }
        })
      }
    })
  },
})