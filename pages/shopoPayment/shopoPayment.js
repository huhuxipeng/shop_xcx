var app = getApp()
Page({
  data: {
    addr: '',
    goodsList: '',
    total: 0,
    showPayAction: false,
    orderId: '',
  },
  onShow(){
    wx.setStorageSync('addr', this.data.addr)
  },
  onLoad(options) {
    let that = this;
    var getaddr = wx.getStorageSync('addr')
    if (getaddr != '') {
      that.setData({
        addr: getaddr
      })
    }


    if (!options.goodsData) {
      return
    }
    let parameter = {
      token: app.util.token,
      goodsData: options.goodsData
    }
    app.http.post_from('order/giftOrderCheckout', parameter).then(res => { //获取选中的店长商品
      let goodsList = res.data.res_data.comList[0].goodsList;
      let goodsJsonList = res.data.res_data.goodsJsonList;
      for (let i = 0; i < goodsList.length; i++) {
        let element = goodsList[i].image;
        let t = app.util.formatImg(element)
        goodsList[i].image = t; //图片格式化
        goodsList[i].price = app.util.strings(goodsList[i].price);
      }
      let total = parseInt(goodsList[0].price) * parseInt(goodsList[0].buyCount);
      that.setData({
        total: total  //总价
      })

      that.setData({
        goodsList: goodsList,
        goodsJsonList: goodsJsonList
      })

    }).catch(e => {
      console.log(e);
    })
  },
  addressee() {
    wx.navigateTo({
      url: '/pages/address/index?isSelect=' + true
    })
  },
  jumpGiftList() {
    wx.navigateTo({
      url: '/pages/giftList/giftList',
    })
  },
  submitFun(){
    let that = this;
    let goodsList = that.data.goodsList;
    let addr = that.data.addr;
    if (goodsList == '') {
      wx.showToast({
        title: '选择购买的商品',
        icon: 'none',
        duration: 1200
      })
      return false
    }
    if (addr == '') {
      wx.showToast({
        title: '收货地址不能为空',
        icon: 'none',
        duration: 1200
      })
      return false
    }
    //支付
    that.setData({
      showPayAction: true,
    })

    let url = '/member/jifenyuetongji'
    let params = {
      token: app.util.token
    }

    app.http.post_from(url, params).then(o => {
      let params = {
        token: app.util.token,
        memberAddressId: that.data.addr.addrId, //用户收货地址ID
        goodsList: that.data.goodsJsonList, //	商户JSON数据
      }
      let url = 'order/createGiftOrder'
      app.http.post_from(url, params).then(o => { //创建订单
        that.setData({
          orderId: o.data.res_data.order.orderId
        })
        let params = {
          token: app.util.token,
          orderId: that.data.orderId,
          payType: 1,
          reqType: 0
        }
        let url = '/pay/giftOrderPay'
        app.http.post_from(url, params).then(o => { //支付
          let obj = o.data.res_data;
          console.log('支付数据', obj)
          that.setData({
            payOptions: obj
          })
        })
      }).catch(e => {
        console.log(e);
      })
    }).catch(e => {
      console.log(e);
    })
  },
})