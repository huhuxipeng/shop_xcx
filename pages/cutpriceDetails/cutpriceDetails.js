let app = getApp()
Page({
  data: {
    shout: false,
    rulePopup: false, //活动规则弹窗
    cutpSuccess: false,
    goodsList: [],
    memberBargainList: [],
    bargainGoods: {},
    member: {},
    barList: '00:00:00',
    time: ''
  },
  onHide() {
    clearInterval(this.data.time)
  },
  onUnload() {
    clearInterval(this.data.time) //清除倒计时
  },
  onShareAppMessage: function () { //数据分享
    let option = {
      orderId: this.data.orderid,
      token: this.data.token ? this.data.token : app.util.token
    }
    return app.util.share(this.data.bargainGoods.shareTitle, option)
  },
  onReady() {
    if (this.data.noFirst) {
      this.getDetail(this.data.token);
      return;
    }
    this.data.noFirst = true;
  },
  onLoad: function (options) {
    console.log('活动', options)
    console.log('数据', app.util.userInfo)

    if(options.orderId){
      options.orderid = options.orderId
    } else if (options.orderid){
      options.orderId = options.orderid
    }

    this.setData(options)
    this.getDetail(this.data.token);
  },
  getUser() {
    // if (this.data.token && this.data.isInvite) { }
    //好友返回帮忙砍价
    let parameter = {
      orderId: this.data.orderId,
      token: app.util.token
    }
    app.http.post_from('bargain/memberBargain', parameter).then(res => {
      console.log('帮砍价成功', res)

      if (res.data.res_data) {
        this.setData({
          bargainPrice: res.data.res_data.bargainPrice,
          cutpSuccess: true
        })
        this.getDetail(this.data.token); //砍价成功更新成员列表
      } else {
        if (res.data.res_info) {
          wx.showModal({
            title: '提示',
            content: res.data.res_info,
          })
        }else{
          wx.showModal({
            title: '提示',
            content: '数据返回错误',
          })
        }
      }
    }).catch(e => {
      console.log(e)
    })
  },
  getDetail(optionsToken) {
    console.log('token', optionsToken)
    var that = this;
    if (optionsToken != undefined) { //好友返回options中有token使用发起人token
      that.setData({
        shout: true
      })
      var token = optionsToken
      var orderId = that.data.orderId;
    } else {
      var token = app.util.token;
      var orderId = that.data.orderId;
    }
    let parameter = {
      orderId: orderId,
      token: token,
    }
    app.http.post_from('bargain/queryBargainDetail', parameter).then(res => { //获取订单砍价详情
      let bargainDataList = res.data.res_data;
      let bargainGoods = bargainDataList.bargainGoods; //头部
      let goodsList = bargainDataList.goodsList; //列表
      let memberBargainList = bargainDataList.memberBargainList; //砍价帮
      let member = bargainDataList.member; //个人信息

      if (bargainGoods.rule!=''){
        bargainGoods.rule = bargainGoods.rule.split('\r\n')
      }

      //头部
      bargainGoods.targetPrice = app.util.strings(bargainGoods.targetPrice);
      bargainGoods.bargainPrices = app.util.strings(bargainGoods.bargainPrices);
      bargainGoods.goodsPrice = app.util.strings(bargainGoods.goodsPrice);

      bargainGoods.goodsImage = app.util.formatImg(bargainGoods.goodsImage)
      bargainGoods.num = bargainGoods.goodsPrice - bargainGoods.bargainPrices - bargainGoods.targetPrice;
      bargainGoods.num = app.util.strings(bargainGoods.num);

      for (let i = 0; i < memberBargainList.length; i++) { //砍价帮
        memberBargainList[i].bargainPrice = app.util.strings(memberBargainList[i].bargainPrice);
      }

      for (let i = 0; i < goodsList.length; i++) { //列表
        goodsList[i].price = app.util.strings(goodsList[i].price);
        goodsList[i].mktprice = app.util.strings(goodsList[i].mktprice);
        let element = goodsList[i].image;
        let t = app.util.formatImg(element)
        goodsList[i].image = t; //图片格式化
      }
      that.setData({
        member: member,
        bargainGoods: bargainGoods,
        memberBargainList: memberBargainList,
        goodsList: goodsList
      })

      let takeDate = bargainGoods.takeDate;
      let gettime = new Date().getTime();
      if (takeDate != null) {
        if (takeDate - gettime > 0) {
          that.data.time = setInterval(function () {
            let gettime2 = new Date().getTime();
            let s = takeDate - gettime2; //时间差
            let day = Math.floor(s / 86400000);
            let hour = Math.floor(s / 3600000);
            let min = Math.floor((s / 60000) % 60);
            let sec = Math.floor((s / 1000) % 60);
            hour = hour < 10 ? "0" + hour : hour;
            min = min < 10 ? "0" + min : min;
            sec = sec < 10 ? "0" + sec : sec;
            let format = "";
            if (day > 0) {
              format = `${hour}:${min}:${sec}` + '后';
            }
            if (day <= 0 && hour > 0) {
              format = `${hour}:${min}:${sec}` + '后';
            }
            if (day <= 0 && hour <= 0) {
              format = `${"00"}:${min}:${sec}` + '后';
            }
            that.setData({
              barList: format
            })
          }, 1000);
        }
      }

    }).catch(e => {
      console.log(e);
    })
  },
  ruleFun() {
    this.setData({
      rulePopup: true
    })
  },
  close2Fun() {
    this.setData({
      rulePopup: false
    })
  },
  detailsUrl(e) {
    let idx = e.currentTarget.dataset.idx;
    let goodsId = this.data.goodsList[idx].goodsId;
    wx.navigateTo({
      url: '/pages/details/details?goodsId=' + goodsId
    })
  },
  cutpSuccess() {
    this.setData({
      cutpSuccess: false
    })
  }
})