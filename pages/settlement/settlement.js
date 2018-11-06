let app = getApp()

Page({
  data: {
    addr: false, //是否有地址
    orderCheckout: 'order/orderCheckout',
    comList: [],
    All: 0,
    common: [], //共计件数
    smallPlan: [], //小计
    productType: false, //海外商品
    identity: '', //身份证
    totalShipAmount: 0, //总邮费
    flashsaleDetail: '', //限时抢购订单详情
    totalPrice: 0, //总价
    showPayAction: false,
    switchvals: false, //是否显示云积分抵扣
    useCloud: 0,
    Wodejia: '',
    show: false,
    weix: false,
    jianPrice: 0,
    INDEX: -1,
    discountPrice: [],
    quanList: [],
    ye: true,
    showPasswordPopup: false,
    fangshi: 0,
    hjf: true,
    couponJson: [],
    xuanlequan: [],
    weixz: true,
    yez: false,
    hjfz: false,
    orderId: '',
    total: 0, //总计
  },
  bindKeyInput(e) {
    this.setData({
      identity: e.detail.value
    })
  },
  wxfu() {
    this.setData({
      weix: false,
      ye: true,
      hjf: true,
      weixz: true,
      yez: false,
      hjfz: false,
      fangshi: 0
    })

  },
  yefu() {
    this.setData({
      weix: true,
      ye: false,
      hjf: true,
      weixz: false,
      yez: true,
      hjfz: false,
      fangshi: 1
    })

  },
  hjffu() {
    this.setData({
      weix: true,
      ye: true,
      hjf: false,
      weixz: false,
      yez: false,
      hjfz: true,
      fangshi: 2
    })

  },
  selectAddress() {
    let href = '../address/index?isSelect=true'
    wx.navigateTo({
      url: href
    })
  },
  onShow() {
    if (this.data.addr) {
      if (this.data.orderType == 1) { //计算限时抢购运费
        this.computeFlashsaleFreight();
      } else { //计算普通商品运费
        this.computeFreight();
      }
    }
    this.init()
  },
  computeFlashsaleFreight() { //计算限时抢购邮费
    let url = "/flashsale/getShipAmount";
    let goodsData = this.data.goodsData
    let params = {
      flashsaleProductId: JSON.parse(goodsData)[0].productId,
      memberAddressId: this.data.addr.addrId,
      cityId: this.data.addr.cityId,
      token: app.util.token,
      buyCount: this.data.flashsaleDetail.buyCount
    }
    app.http.post_from(url, params)
      .then(data => {
        this.setData({
          totalShipAmount: this.data.res_data.shipAmount,
          total: this.data.res_data.shipAmount + this.data.flashsaleDetail.flashsalePrice
        })
      })
      .catch(err => {
        console.log(err);
      });
  },
  computeFreight() {
    if (this.data.addr) {
      if (this.data.orderType != 2) {
        //计算运费
        let url = "/order/computeOrderFreight";
        let params = {
          goodsList: this.data.goodsJsonList,
          memberAddressId: this.data.addr.addrId,
          token: app.util.token
        }
        app.http.post_from(url, params).then(data => {
          let totalShipAmount = 0;
          let comList = this.data.comList;
          for (let i = 0; i < data.data.res_data.freightList.length; i++) {
            totalShipAmount += data.data.res_data.freightList[i].shipAmount
            comList[i].shipAmount = data.data.res_data.freightList[i].shipAmount;
            // let total = app.util.strings(parseFloat(this.data.total) + comList[i].shipAmount)
            // this.setData({
            //   total: total
            // })
            console.log('QQ', this.data.total)
          }
          this.setData({
            comList: comList,
            totalShipAmount,
            goodsTotalPrice: app.util.strings(parseFloat(this.data.total) + parseFloat(totalShipAmount)),
          })

        }).catch(err => {
          console.log(err);
        });
      }
    } else {
      wx.showToast({
        title: '请选择地址',
      })
    }
  },
  onLoad(options) {
    console.log('监考老师大飞哥', options)
    this.setData(options)
  },
  init() {
    // return
    let that = this;
    let token = app.util.token;
    let goodsdata = that.data.goodsData;
    let orderType = that.data.orderType;

    let params = {};
    if (orderType == 1) { //限时抢购商品
      that.getFlashsaleDetail();
      return;
    } else if (orderType == 2) { //金币兑换商品
      that.getGoldChangerDetail(options.goodsData)
      return;
    } else if (orderType == 4) { //砍价商品，3好像被拼团给用了
      that.getBarginDetail()
      return;
    } else { //普通商品 orderType==0;或者undefined
      params = {
        token: token,
        goodsData: goodsdata,
      }
    }

    app.http.post_from(that.data.orderCheckout, params).then(res => {
      let res_data = res.data.res_data
      this.data.goodsJsonList = res_data.goodsJsonList; //查看邮费参数
      let comList = res_data.comList;
      let common = that.data.common;
      let smallPlan = that.data.smallPlan;
      let memberAddressList = res_data.memberAddressList //收货地址列表
      let shipAmount = res_data.shipAmount
      let goodsTotalPrice = res_data.goodsTotalPrice
      if (memberAddressList) {
        memberAddressList.forEach(o => {
          if (o.defAddr) {
            this.setData({
              addr: o
            })
          }
        })
      }
      if (res_data.cloudPoint > 0) {
        this.setData({
          switchvals: true,
          cloudPoint: res_data.cloudPoint,
        })
      }
      var tArray = new Array();
      var moneyArray = new Array();
      var sum = 0;
      var moneysum = 0;
      let m = [];
      let duix = [];
      let shuzu = this.data.couponJson;
      for (let i = 0; i < comList.length; i++) {
        let goodsType = res_data.comList[i].goodsType;
        var obj = shuzu[i];
        obj = {
          "comId": res_data.comList[i].comId
        };
        duix.push(obj);


        this.setData({
          couponJson: duix
        })

        if (goodsType == 1) { //海外商品
          that.setData({
            productType: true
          })
        }
        m.push(true)
        let len2 = comList[i].goodsList.length;
        tArray[i] = new Array(); //共计件数
        moneyArray[i] = new Array(); //小计金额
        for (let j = 0; j < len2; j++) {
          comList[i].goodsList[j].price = app.util.strings(comList[i].goodsList[j].price);
          var element = comList[i].goodsList[j].image;
          let t = app.util.formatImg(element)
          comList[i].goodsList[j].image = t; //图片格式化
          tArray[i][j] = comList[i].goodsList[j].buyCount;
          moneyArray[i][j] = comList[i].goodsList[j].buyCount * comList[i].goodsList[j].price;
        }
      }

      that.setData({
        xuanlequan: m
      })

      for (let i = 0; i < tArray.length; i++) { //小计金额和共计件数
        if (tArray[i].length > 1) {
          for (let j = 0; j < tArray[i].length; j++) {
            sum += tArray[i][j];
            moneysum += moneyArray[i][j];
            moneyArray[i][j] = app.util.strings(parseFloat(moneyArray[i][j])); //计算钱小数点
          }
          tArray[i].length = 0;
          moneyArray[i].length = 0;
          tArray[i].push(sum)
          moneyArray[i].push(moneysum)
        }
        moneyArray[i] = app.util.strings(parseFloat(moneyArray[i])); //计算钱小数点

        common.push(tArray[i])
        smallPlan.push(moneyArray[i])
        // let total = parseFloat(app.util.strings(parseFloat(this.data.total) + parseFloat(moneyArray[i])))
        let total = app.util.strings(parseFloat(this.data.total) + parseFloat(moneyArray[i]))
        this.setData({
          total: total
        })
      }
      that.setData({
        comList: comList,
        common: common,
        smallPlan: smallPlan,
        totalShipAmount: shipAmount,
        total: that.data.total,
        goodsTotalPrice: app.util.strings(parseFloat(this.data.total) + parseFloat(shipAmount)),
        cartIds: res_data.cartIds,
      })

    }).catch(e => {
      console.log(e);
    })
  },
  getBarginDetail() { //砍价详情
    let goodsdata = this.data.goodsData;
    let params = {
      token: app.util.token,
      productId: JSON.parse(goodsdata)[0].productId,
      orderId: JSON.parse(goodsdata)[0].bargainOrderId,
    };
    console.log(JSON.parse(goodsdata)[0])
    let url = '/bargain/bargainOrderCheckout';
    app.http.post_from(url, params).then(o => {
      console.log('barginDetail', o)
      let res_data = o.data.res_data
      res_data.goods.image = app.util.formatImg(res_data.goods.image)
      let memberAddressList = res_data.memberAddressList //收货地址列表
      if (memberAddressList) {
        memberAddressList.forEach(o => {
          if (o.defAddr) {
            this.setData({
              addr: o,
            })
          }
        })
      }
      this.setData({
        bargainDetail: res_data,
        bargainId: '2142424',
        goodsTotalPrice: res_data.bargainOrder.orderAmount
      })
    })
  },
  getGoldChangerDetail(goodsData) {
    let url = "/order/coinExchangeOrderCheckout";
    let goodsdata = this.data.goodsData;
    let params = {
      token: app.util.token,
      productId: JSON.parse(goodsdata)[0].productId, //兑换商品ID
      buyCount: JSON.parse(goodsdata)[0].buyCount,
      id: JSON.parse(goodsdata)[0].goldChangerId,
    };
    app.http.post_from(url, params).then(o => {
      console.log('goldDetail', o)
      if (o.data.res_data != null) {
        let res_data = o.data.res_data
        res_data.goodsImage = app.util.formatImg(res_data.goodsImage)
        let memberAddressList = res_data.memberAddressList //收货地址列表
        if (memberAddressList) {
          memberAddressList.forEach(o => {
            if (o.defAddr) {
              this.setData({
                addr: o
              })
            }
          })
        }
        this.setData({
          goldChangerDetail: res_data,
          total: res_data.totalPrice
        })
      } else {
        wx.showModal({
          title: '提示',
          content: '该商品已下架,请选择其他商品购买',
          showCancel: false,
          success() {
            wx.navigateBack({})
          }
        })

        return
      }
    })
  },
  getFlashsaleDetail() {
    let url = "/flashsale/rushBuy";
    let goodsdata = this.data.goodsData;
    let params = {
      token: app.util.token,
      buyCount: JSON.parse(goodsdata)[0].buyCount,
      flashsaleProductId: JSON.parse(goodsdata)[0].productId //抢购商品ID
    };
    app.http.post_from(url, params).then(o => {
      if (o.data.res_code != 0) {
        wx.showModal({
          title: '提示',
          content: o.data.res_info,
          showCancel: false,
          success() {
            wx.navigateBack({})
          }
        })
        return;
      }
      let res_data = o.data.res_data
      res_data.goodsImage = app.util.formatImg(res_data.goodsImage)
      let memberAddressList = res_data.memberAddressList //收货地址列表
      if (memberAddressList) {
        memberAddressList.forEach(o => {
          if (o.defAddr) {
            this.setData({
              addr: o
            })
          }
        })
      }
      this.setData({
        flashsaleDetail: res_data,
        totalShipAmount: res_data.shipAmount,
        total: res_data.totalPrice
      })
    })
  },
  useCloudChange(e) {
    this.setData({
      useCloud: e.detail.value ? 1 : 0
    })
  },
  tanQuan(e) {
    this.setData({
      Wodejia: e.currentTarget.dataset['item'].totalPrice
    })

    this.setData({
      quanList: e.currentTarget.dataset['item'].couponList
    })
    this.setData({
      INDEX: e.currentTarget.dataset['index']
    })

    this.setData({
      show: true,
    })
  },
  creatGoldChangerOrder() { //创建金币兑换订单
    let goodsdata = this.data.goodsData;
    console.log('sss', this.data.goodsData)
    let obj = JSON.parse(goodsdata)[0];
    let url = '/order/createCoinExchangeOrder';
    let params = {
      id: obj.goldChangerId,
      buyCount: obj.buyCount,
      productId: obj.productId,
      memberAddressId: this.data.addr.addrId,
      exchangeCoin: this.data.total,
      token: app.util.token
    }
    app.http.post_from(url, params).then(o => {
      if (o.data.res_code != 0) {
        wx.showModal({
          title: '提示',
          content: o.data.res_info,
          showCancel: false,
        })
        return;
      }
      console.log(22222222)
      let orderId = o.data.res_data.coinExchangeGoods.orderId
      let params = {
        payType: 3,
        orderId: orderId,
        reqType: 0,
        token: app.util.token,
        totalExchangeCoin: this.data.total
      }
      let url = '/pay/coinExchangeOrderPay'
      app.http.post_from(url, params).then(o => {

        wx.showModal({
          title: '提示',
          content: '兑换成功',
          showCancel: false,
          success() {
            let href = '../orderDetail/index?orderId=' + orderId + '&orderType=2&id=' + obj.goldChangerId
            wx.navigateTo({
              url: href
            })
          }
        })
      })
    }).catch(e => {
      console.log(url, e)
    })
  },
  creatFlashsaleOrder(option) { //创建限时抢购订单
    let url = '/flashsale/createOrder'
    let goodsdata = this.data.goodsData;
    let obj = JSON.parse(goodsdata)[0];
    let params = {
      buyCount: obj.buyCount,
      flashsaleId: obj.flashsaleId,
      flashsaleProductId: obj.productId,
      memberAddressId: this.data.addr.addrId,
      token: app.util.token,
    }
    app.http.post_from(url, params).then(o => {
      let orderId = o.data.res_data.order.orderId
      this.setData({
        orderId,
        flashsaleId: obj.flashsaleId,
      })
    }).catch(e => {
      console.log(url, e)
    })
  },
  creatBargainOrder() { //创建砍价订单
    let url = '/bargain/relationOrderAddress'
    let params = {
      token: app.util.token,
      addrId: this.data.addr.addrId,
      orderId: this.data.bargainDetail.bargainOrder.orderId
    }
    app.http.post_from(url, params).then(o => {
      this.setData({
        orderId: this.data.bargainDetail.bargainOrder.orderId,
      })
    }).catch(e => {
      console.log(url, e)
    })
  },
  paymentFun() { //立即支付

    if (!this.data.addr) {
      wx.showModal({
        title: '提示',
        content: '请先选择收货地址',
        showCancel: false,
      })
      return;
    }
    if (this.data.productType) { //如果是海外商品
      let identity = this.data.identity; //身份证验证
      let regIdNo = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
      if (!regIdNo.test(identity)) {
        console.log('身份证号填写有误');
        return false;
      }
    }
    if (this.data.orderType == 2) { //如果是金币兑换订单
      this.creatGoldChangerOrder()
      return;
    }
    this.setData({
      showPayAction: true,
    })
    if (this.data.orderId) { //如果已经有订单ID了

      return;
    }
    if (this.data.orderType == 1) { //如果是限时抢购订单
      this.creatFlashsaleOrder()
      return;
    }
    if (this.data.orderType == 4) { //如果是砍价订单
      this.creatBargainOrder();
      return;
    }

    // console.log(this.data.couponJson[0]);
    if (this.data.couponJson[0].cpnId == undefined) {
      this.setData({
        couponJson: ""
      })
    }


    let params = {
      token: app.util.token,
      memberAddressId: this.data.addr.addrId,
      goodsList: this.data.goodsJsonList,
      isCloudPoint: this.data.useCloud ? 1 : 0,
      cartIds: this.data.cartIds,
      couponJson: JSON.stringify(this.data.couponJson)
    }
    // this.data.couponJson
    let url = '/order/createGoodsOrder'
    app.http.post_from(url, params).then(o => {
      // console.log('oooooo', o)
      this.setData({
        orderId: o.data.res_data.order.orderId
      })

      // console.log(this.data.fangshi)

      // //使用微信支付
      // if (this.data.fangshi == 0 ){

      // }
      // //使用余额支付
      // if (this.data.fangshi == 1) {
      //   this.setData({
      //     showPasswordPopup:true
      //   })

      //   console.log(this.data.showPasswordPopup)

      // }
      // // 使用红积分支付
      // if (this.data.fangshi == 2) {

      // }











      // let params = {
      //   token: app.util.token,
      //   orderId: this.data.orderId,
      //   isCloudPoint: this.data.useCloud ? 1 : 0,
      //   payType: 1,
      //   reqType: 0
      // }
      // let url = '/pay/orderPay'//微信支付相关，暂时不用了
      // app.http.post_from(url, params).then(o => {
      //   let obj = o.data.res_data;
      //   console.log('支付数据', o.data.res_data)
      //   this.setData({
      //     payOptions: obj
      //   })
      // })
    }).catch(e => {
      console.log(url, e);
    })
    // let url = '/member/jifenyuetongji'
    // let params = {
    //   token: app.util.token
    // }
    // app.http.post_from(url, params).then(o => {


    // }).catch(e => {
    //   console.log(url, e);
    // })
  }
})