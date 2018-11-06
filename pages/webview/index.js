// pages/webview/index.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    src: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options.source) {

      let src = 'https://wx.juyooo.com/bobing/#/login?'
      for (var i in options) {
        if (i != 'source') {
          src = src + i + '=' + options[i] + '&'
        }
      }
      src = src.substring(0, src.length - 1)
      this.setData({
        src: src,
      })

    } else if (options.payInfo) {
      let src = wx.getStorageSync('payInfo')
      options.src = src;
      console.log('src', options.src)
      this.setData(options)
    } else if (app.util.token) {
      this.setData({
        src: options.src + '?token=' + app.util.token
      })
    } else {
      this.setData({
        src: options.src
      })
    }
  },
  bindmessage(e) {
    console.log(e)
  },
  bindload(e) {
    // function ready() {
    //   var u = navigator.userAgent,
    //     app = navigator.appVersion;
    //   var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
    //   if (isIOS) { //如果是苹果手机
    //     if (window.__wxjs_environment === 'miniprogram') { //如果是小程序环境
    //     let params = {};//唤起支付要用的所有参数
    //       wx.miniProgram.postMessage(params)
    //     }
    //   }
    // }
    // if (!window.WeixinJSBridge || !WeixinJSBridge.invoke) {
    //   document.addEventListener('WeixinJSBridgeReady', ready, false)
    // } else {
    //   ready()
    // }

  },
  binderror(e) {
    console.log('binderror', e)
    wx.showModal({
      title: '提示',
      content: '触发binderror了' + e.detail,
    })
  },
  getMoonList(moonId) {
    let url = 'moon/anon/queryMoonActivityList'
    let params = {
      pageNo: 0,
      pageSize: 0,
      token: app.util.token,
    }
    app.http.post_from(url, params).then(o => {
      if (o.data.res_code == 0) {
        let moonList = o.data.res_data.dataList
        moonList.forEach(o => { //遍历房间列表匹配，moonId
          if (o.moonId == moonId) {
            let lotteryCycle = o.lotteryCycle;
            this.setData({
              lotteryCycle,
              moonId
            })
          }
        })
      } else {
        wx.showModal({
          title: '提示',
          content: o.data.res_info,
          showCancel: false,
        })
      }
    }).catch(e => {

    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    console.log('show', )
  },
  addMoonTime(paramsStr) { //增加博饼次数
    let url = 'moon/moonShare'
    let params = {
      lotteryCycle: this.data.lotteryCycle,
      moonId: this.data.moonId,
      token: app.util.token
    }
    app.http.post_from(url, params).then(o => {
      let src = 'https://wx.juyooo.com/bobing/#/yindao?' + paramsStr
      this.setData({
        src: src
      })
    })
  },
  onUnload() { //卸载页面
    console.log('unLoad');
    let orderId = this.data.orderId;
    let orderType = this.data.orderType;
    if (orderId) { //那就去订单详情吧
      if (this.data.spellId) { //如果是拼团
        wx.navigateTo({
          url: '../../pages/groupTime/index?orderId=' + this.data.orderId + '&spellId=' + this.data.spellId
        })
      } else if (this.data.flashsaleId) { //如果是限时抢购
        wx.navigateTo({
          url: '../../pages/orderDetail/index?orderId=' + this.data.orderId + '&orderType=1'
        })
      } else if (this.data.bargainId) { //砍价订单
        wx.navigateTo({
          url: '../../pages/cutpriceDetails/cutpriceDetails?orderId=' + this.data.orderId
        })
      } else {
        wx.navigateTo({
          url: '../../pages/orderDetail/index?orderId=' + this.data.orderId
        })
      }
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage(options) {
    console.log('options', options)
    let title = ''
    var pages = getCurrentPages();
    let path = pages[pages.length - 1].route;

    let source = options.webViewUrl
    let paramsArr = source.split('?')
    let paramsStr;
    path = path + '?source=true'
    if (paramsArr.length > 1) {

      paramsStr = paramsArr[paramsArr.length - 1];
      if (source.indexOf('newHome') != -1) {
        paramsStr = paramsStr + '&zhuanc=true'
      }
      path = path + '&' + paramsStr
    }
    if (source.indexOf('home') != -1) { //如果是博饼房间
      let paramsArrStr = paramsStr.split('&');
      paramsArrStr.forEach(o => { //对H5地址进行处理，获取到roomId
        let a = o.split('=');
        if (a[0] == 'roomId') {
          let roomId = a[1]
          this.getMoonList(roomId);
        }
      })
    }
    var that = this;
    return {
      title: '',
      path: path,
      success(res) { //转发成功
        if (that.data.lotteryCycle) { //如果拿到lotteryCycle，就给他加 博饼次数
          that.addMoonTime(paramsStr)
        }
      },
      // path: path + '?source=' + source + '&route=' + route + '&' + params
    }
  }
})