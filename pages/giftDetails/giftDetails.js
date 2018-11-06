var app = getApp()
Page({
  data: {
    goodsId:'',
    parameterState: false,
    animationData: {},
    parameterNum: 1,
  },
  jumpFun(){
    let giftPackageProductList = this.data.res.giftPackageProductList;
    let goodsData = [];
    let goods = {};
    for (let i = 0; i < giftPackageProductList.length;i++){
      goods.productId = giftPackageProductList[i].gpProductId;
      goods.buyCount = this.data.parameterNum;
    }
    goodsData.push(goods);
    wx.navigateTo({
      url: '/pages/shopoPayment/shopoPayment?goodsData=' + JSON.stringify(goodsData)
    })
  },
  parameterPlus: function (e) { //参数加
    var parNum = this.data.parameterNum;
    var par = parNum + 1;
    this.setData({
      parameterNum: par
    })
  },
  parameterReduce: function (e) { //参数减
    var parNum = this.data.parameterNum;
    if (parNum <= 1) {
      return false;
    }
    var par = parNum - 1;
    this.setData({
      parameterNum: par
    })
  },
  showFun: function (e) {
    this.animation.translateY(-500).step()
    this.setData({
      //输出动画
      animationData: this.animation.export()
    })

    //点击商品参数打开参数弹窗
    this.setData({
      parameterState: true,
    })
  },
  hideFun: function (e) {
    this.animation.translateY(400).step()
    this.setData({
      //输出动画
      animationData: this.animation.export()
    })
    //点击背景和确认按钮关闭参数弹窗

    this.setData({
      parameterState: false,
    })
  },
  onShow(options) {
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease',
    })
    this.animation = animation
  },
  onLoad(options) {
    let that = this;
    that.setData({
      goodsId: options.gpId
    })

    let parameter = {
      token: app.util.token,
      gpId: options.gpId
    }

    app.http.post_from('goods/giftPackageDetails', parameter).then(res => { //获取推荐列表
      let res_data = res.data.res_data;
      let giftPackage = res.data.res_data.giftPackage;
      let swipers = res.data.res_data.giftPackageGallery;
      let datas = res.data.res_data.giftPackage;        //基本信息

      for(let i =0;i<swipers.length; i++){
        let element = swipers[i].image;
        let t = app.util.formatImg(element)
        swipers[i].image = t; //图片格式化
      }

      giftPackage.mktprice = app.util.strings(giftPackage.mktprice);
      giftPackage.price = app.util.strings(giftPackage.price);
      
      that.setData({
        swipers: swipers,
        giftPackage: giftPackage,
        datas: datas,
        res: res_data
      })
    }).catch(e => {
      console.log(e);
    })
  },
})