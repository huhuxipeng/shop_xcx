// pages/appraise/index.js
import upng from '../../static/js/upng.js'
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderSn: '',
    appraiseType: '',
    imageList: [],
    imgSrc: '',
    canvasWidth: 150,
    canvasHeight: 150
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    this.data.orderSn = options.orderSn
    this.data.orderType = options.orderType
    this.getDetail()
  },
  getDetail() {
    let url = "/order/initOrderComment";
    let params = {
      orderSn: this.data.orderSn,
      token: app.util.token,
      orderType: this.data.orderType,
    }
    app.http.post_from(url, params).then(o => {
      let res_data = o.data.res_data
      res_data.orderItemsList.forEach(o => {
        o.goodsImage = app.util.formatImg(o.goodsImage)
      })
      console.log(res_data)
      this.setData({
        detail: res_data
      })
    })
  },
  selectImg() {
    wx.showLoading()
    var that = this;
    let option = {
      count: 5, //最多选几张
      sizeType: ['compressed'], //压缩图
      success(o) {
        that.drawCanvas(o.tempFilePaths, 0)
      },
      fail(e) {
        console.log('e', e);
      },
      complete() {
        wx.hideLoading()
      }
    }
    wx.chooseImage(option)
  },
  submit() {
    let url = "order/doOrderComment";
    let imageListStr = '';
    this.data.imageList.forEach((o, index) => {
      if (index < this.data.imageList.length - 1) {
        imageListStr += o + ','
      } else {
        imageListStr += o
      }
    })
    let dataList = [];
    dataList.push({
      itemId: this.data.detail.orderItemsList[0].itemId,
      content: this.data.appraiseText,
      score: this.data.appraiseType,
      imageList: imageListStr,
    })
    let commentData = {
      dataList
    }
    let params = {
      anonFlag: this.data.anonFlag?1:0, //是否匿名评价
      commentData: JSON.stringify(commentData),
      orderSn: this.data.orderSn,
      orderType: 0, //0普通订单，1抢购订单，
      token: app.util.token
    }
    app.http.post_from(url, params).then(o => {
      wx.showModal({
        title: '提示',
        content: o.data.res_info,
        success() {
          if (o.data.res_code == 0) {
            wx.navigateBack({})
          }
        },
        showCancel:false
      })

    })
  },
  deleteImg(e){
    console.log(e)
    let index = e.currentTarget.dataset.index;
    this.data.imageList.splice(index,1)
    this.setData({
      imageList: this.data.imageList
    })
  },
  drawCanvas(tempFilePaths, index) { //通过画布压缩并上传图片
    console.log(tempFilePaths, index)
    if (index == tempFilePaths.length) {
      return;
    }

    var that = this;
    const platform = wx.getSystemInfoSync().platform
    const ctx = wx.createCanvasContext('attendCanvasId');
    wx.getImageInfo({
      src: tempFilePaths[index],
      success: function(a) {
        console.log(a)
        let width = 150;
        let height = 150 * a.height / a.width;
        that.setData({
          canvasWidth: width + 'px',
          canvasHeight: height + 'px',
        })
        ctx.drawImage(tempFilePaths[index], 0, 0, width, height);
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
              // 3. png编码
              let pngData = upng.encode([res.data.buffer], res.width, res.height)
              // 4. base64编码
              let base64 = wx.arrayBufferToBase64(pngData)
              let url = 'member/anon/base64UploadImg'
              let params = {
                data: base64,
                type: 9, // 8-头像图片上传 9-评价图片上传
              }
              app.http.post_from(url, params).then(o => {
                console.log('uploadImg', o);
                let imageList = that.data.imageList
                imageList.push(o.data.data.filePath);
                that.setData({
                  imageList,
                })
                that.drawCanvas(tempFilePaths, index + 1); //通过递归函数一张张上传，这里需要等上传完成再执行,单张图片可以删掉这行
              })
            },
            fail(e) {
              console.log('e', e)
            },
            complete(e) {

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
  },
  changeValue(e) {
    let options = {};
    if (e.detail.value) { //输入框专用
      options[e.target.dataset.prop] = e.detail.value
    } else { //zanUi的组件的change事件
      options[e.target.dataset.prop] = e.detail
    }
    this.setData(options);
    console.log(this.data)
  },
  selectType(e) {
    this.setData({
      appraiseType: e.currentTarget.dataset.type
    })
  },
})