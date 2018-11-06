var app = getApp()
Page({
  data: {
    collection: false, //收藏
    goodsId: '',
    url: 'goods/anon/goodsDetails',
    data: {}, //后台返回的全部数据，用于选择规格弹窗,
    show: false,
    showCouponPopup: false,
    couponList: [],
    index:0,
    showCouponDetail:false,
    identityId: 2,
    time: {
      h: '00',
      m: '00',
      s: '00'
    }
  },
  onShareAppMessage: function() { //数据分享
    return {
      title: '巨柚商城·品质优选',
      desc: '最具人气的小程序超级商城!',
      imageUrl: "https://jymall.oss-cn-beijing.aliyuncs.com/other/20180614/ed915df5-ae52-47e3-9f33-f6c890278bfc.jpg?x-oss-process=image/resize,w_375",
      path: '' //页面路径
    }
  },
  onShow() {
    if (this.data.goldChangerId) {
      this.getGoldChangerDetail()
    }
  },
  onLoad: function(options) {
    console.log('参数',options)
    let that = this;
    if (wx.getStorageSync('userInfo')) {
      var userInfo = JSON.parse(wx.getStorageSync('userInfo'));
      let identityId = userInfo.identityId;
      that.setData({
        identityId: identityId
      })
    }
    that.setData(options)
    if (options.goodsId){
      that.getCouponList();
    }

    let parameter = {
      goodsId: that.data.goodsId, //商品ID
      token: app.util.token,
    };
    if (options.flashsaleId) { //如果是限时抢购
      this.getFlashsaleDetail();
      return;
    }
    if (options.goldChangerId) { //如果金币兑换
      this.getGoldChangerDetail();
      return;
    }
    app.http.post_from(that.data.url, parameter).then(res => { //获取商品分类列表
      app.globalData.comTel = res.data.comTel;

      let swipers,
        buyCount, //已售数量
        bond, //保证金
        datas, //基本信息
        shopStore, //店铺信息
        redPointRatio, //自购红积分
        cloudPointRatio, //自购云积分
        ExtensionRedPointRatio, //推广红积分
        ExtensionCloudPointRatio; //推广云积分

      datas = res.data.good; //基本信息
      console.log('似懂非懂',res.data)
      this.setData({
        data: res.data,
        tagName: res.data.good.tagName
      })

      datas.price = app.util.strings(datas.price);
      datas.mktprice = app.util.strings(datas.mktprice);

      let red = res.data.redPointRatio * res.data.good.profit; //红积分比例 * 商品利润 = 自购红积分
      red = app.util.strings(red);

      let cloud = res.data.cloudPointRatio * res.data.good.price; //自购云积分
      cloud = app.util.strings(cloud);

      ExtensionRedPointRatio = res.data.ExtensionRedPointRatio * res.data.good.profit; //推广红积分 * 商品利润 = 推广红积分
      ExtensionRedPointRatio = app.util.strings(ExtensionRedPointRatio);

      ExtensionCloudPointRatio = res.data.ExtensionCloudPointRatio * res.data.good.price; //推广云积分
      ExtensionCloudPointRatio = app.util.strings(ExtensionCloudPointRatio);

      that.setData({
        swipers: res.data.GoodsGallery,
        buyCount: res.data.buyCount,
        bond: res.data.bond,
        datas: datas,
        shopStore: res.data.shopStore,
        redPointRatio: red,
        cloudPointRatio: cloud,
        ExtensionRedPointRatio: ExtensionRedPointRatio,
        ExtensionCloudPointRatio: ExtensionCloudPointRatio,
        collection: res.data.flag ? res.data.flag : false,
      })
    }).catch(e => {
      console.log(e);
    })
  },
  takeCoupon(e){//立即领取优惠券
    let cpnId = e.currentTarget.dataset.item.cpnId;
    let url = 'coupon/memberGetCoupon'
    let params = {
      cpnId: cpnId,
      token:app.util.token,
    }
    app.http.post_from(url,params).then(o=>{
      if(o.data.res_code==0){
        this.getCouponList();
      }
      wx.showModal({
        title: '提示',
        content: o.data.res_info,
        showCancel:false,
      })
    })
  },
  getCouponList() { //获取优惠券列表
    let url = 'coupon/anon/couponList';
    let params = {
      pageNo: 0,
      pageSize: 0,
      relId: this.data.goodsId,
      relType: 1,
    }
    if(app.util.token){
      params.token = app.util.token
    }

    app.http.post_from(url, params).then(o => {
      let couponList = o.data.res_data.dataList;
      couponList.forEach(o => {
        switch (o.cpnType) {
          case 0:
            o.typName = '分类券';
            o.color = 'color_1';
            break;
          case 1:
            o.typName = '商品券';
            o.color = 'color_3';
            break;
          case 2:
            o.typName = '店铺券';
            o.color = 'color_2';
            break;
          case 3:
            o.typName = '通用券';
            o.color = 'color_4';
            break;
        }
        o.getBeginTime = new Date(o.getBeginTime).format('yyyy-MM-dd');
        o.getEndTime = new Date(o.getEndTime).format('yyyy-MM-dd');
      })
      this.setData({
        couponList
      })
    }).catch(e => {
      console.log('err', e)
    })
  },
  pickCoupon() {//打开领取优惠券弹窗
    this.setData({
      showCouponPopup: true
    })
  },
  hideCouponPopup() {//关闭领取优惠券弹窗
    this.setData({
      showCouponPopup: false
    })
  },
  iExtension() {
    let parameter = {
      goodsId: this.data.goodsId,
      token: app.util.token
    }
    app.http.post_from('member/memberPromote', parameter).then(res => {
      if (res.data.res_code == 1) {
        wx.showModal({
          title: '提示',
          showCancel: false,
          content: res.data.res_info,
        })
      } else {
        wx.showModal({
          title: '已添加到个人中心',
          showCancel: false,
          content: '可到"个人中心-我的商品"中查看',
        })
      }
    }).catch(e => {
      console.log(e)
    })
  },
  getGoldChangerDetail() { //获取金币兑换商品详情
    let url = '/goods/anon/coinExchangeGoodsDetails'
    let cparams = {
        token: app.util.token,
        id: this.data.goldChangerId
      }
   
    app.http.post_from(url, params).then(o => {
      console.log('链接',o)
      if (o.data.res_data.activityNum == 0) {
        this.setData({
          activityNum: false
        })
      } else {
        this.setData({
          activityNum: true
        })
      }
      let res_data = o.data.res_data
      let shopStore = {
        shopStoreLogo: app.util.formatImg(res_data.shopStoreLogo, 2),
        shopStoreName: res_data.shopStoreName
      }
      res_data.good = {
        image: res_data.squareImage,
        exchangeCoin: res_data.exchangeCoin
      }
      this.setData({
        swipers: res_data.goodsGallery,
        datas: res_data,
        shopStore: shopStore,
        goodsId: res_data.goodsId,
        bond: res_data.bond,
        data: res_data
      })
    })
  },
  getFlashsaleDetail() { //获取限时抢购商品详情
    let url = '/flashsale/anon/getFlashsaleGoodsDetail'
    let params = {
      token: app.util.token,
      flashsaleGoodsId: this.data.flashsaleGoodsId,
      flashsaleId: this.data.flashsaleId
    }
    app.http.post_from(url, params).then(res => {
      let datas = res.data.res_data.goodsDetail.good
      let goodsDetail = res.data.res_data.goodsDetail
      let flashsaleGoodInfo = res.data.res_data.goodsInfo
      let flashsaleActivity = res.data.res_data.flashsaleActivity;
      let t = flashsaleActivity.endTime - flashsaleActivity.nowTime
      this.settime(t)
      this.data.setInver = setInterval(o => {
        t -= 1000;
        this.settime(t)
      }, 1000)
      this.setData({
        swipers: goodsDetail.GoodsGallery,
        data: goodsDetail,
        bond: goodsDetail.bond,
        flashsaleGoodInfo: flashsaleGoodInfo,
        datas: datas,
        shopStore: goodsDetail.shopStore,
      })
    }).catch(e => {
      console.log(url, e)
    })
  },
  serviceFun() {
    app.serviceFun();
  },
  settime(t) {
    if (t > 0) {
      let day = Math.floor(t / 86400000);
      let hour = Math.floor(t / 3600000);
      let min = Math.floor((t / 60000) % 60);
      let sec = Math.floor((t / 1000) % 60);
      hour = hour < 10 ? "0" + hour : hour;
      min = min < 10 ? "0" + min : min;
      sec = sec < 10 ? "0" + sec : sec;
      let format = "";
      let times = {}
      if (day > 0) {
        times = {
          h: hour,
          m: min,
          s: sec,
        }
      }
      if (day <= 0 && hour > 0) {
        times = {
          h: hour,
          m: min,
          s: sec,
        }
      }
      if (day <= 0 && hour <= 0) {
        times = {
          h: '00',
          m: min,
          s: sec,
        }
      }
      this.setData({
        time: times
      })
    } else {
      clearInterval(this.data.setInver)
    }
  },
  collectionFun() { //收藏
    let that = this;
    let collection = that.data.collection;
    let good = that.data.data.good;
    let parameter = {
      currencyId: good.goodsId,
      flag: collection,
      goodsType: 0,
      token: app.util.token,
    };
    app.http.post_from('goods/collectGoods', parameter).then(res => { //收藏
      wx.showToast({
        title: res.data.res_info,
        icon: 'success',
        duration: 1200
      })
      collection = !collection;
      that.setData({
        collection: collection
      })
    }).catch(e => {
      console.log(e);
    })
  },
  onUnload() {
    if (this.data.setInver) {
      clearInterval(this.data.setInver)
    }
  },
  onHide() {
    if (this.data.setInver) {
      clearInterval(this.data.setInver)
    }
  },
  showFooterBuy() {
    if (this.data.datas.memberCoin - this.data.datas.exchangeCoin < 0) {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '金币不足,您的金币数量为' + this.data.datas.memberCoin
      })
    } else {
      this.setData({
        show: true,
      })
    }
  },
  becomeShop() {
    if (app.util.token) {
      wx.navigateTo({
        url: '/pages/shopowner/shopowner',
      })
    } else {
      wx.navigateTo({
        url: '/pages/phoneSign/phoneSign',
      })
    }
  },
  cartFun(){
    if(app.util.token){
      wx.switchTab({
        url: '/pages/shopcar/shopcar',
      })
    }else{
      wx.navigateTo({
        url: '/pages/phoneSign/phoneSign',
      })
    }
  }
})