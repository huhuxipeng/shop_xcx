var app = getApp()
Page({
  data: {
    res_data: '',
    explain: false,
    goodsId: '',
    collection: false,
    show: false,
    data: {},//选规格相关数据
    time: '',
    time2: ''
  },

  onShow() {
    if (this.data.noFirst) {
      this.getDetail();
      return;
    }
    this.data.noFirst = true;
  },
  onHide() {
    clearInterval(this.data.time)
    clearInterval(this.data.time2)
  },
  onUnload() {
    clearInterval(this.data.time)
    clearInterval(this.data.time2)
  },
  onLoad(options) {
    // console.log('拼团详情options',options)
    this.setData(options)
    console.log('参数',options)
    this.getDetail();
    return;

    
    // let that = this;
    // let parameter = {
    //   activityId: options.activityId,
    //   token: app.util.token,
    // };
    // app.http.post_from('spell/anon/getActivityDetails', parameter).then(res => { //获取拼团商品详情
    //   let res_data = res.data.res_data;
    //   // console.log('拼团详情', res_data)
    //   res_data.spellPrice = app.util.strings(res_data.spellPrice);
    //   res_data.goodsPrice = app.util.strings(res_data.goodsPrice);
    //   res_data.rulesArr = res_data.rules.split('\r\n').map(o => {
    //     if (o.indexOf('u') != -1) {
    //       o = o.substr(1)
    //     }
    //     return o;
    //   });
    //   let element = res_data.shopStoreLogo;
    //   let t = app.util.formatImg(element)
    //   res_data.shopStoreLogo = t; //图片格式化
    //   that.setData({
    //     res_data: res_data,
    //     goodsId: res_data.goodsId,
    //     collection: res_data.flag,
      // })
    // }).catch(e => {
    //   console.log(e);
    // })
  },
  moreFun() {
    this.setData({
      groupPopup: true
    })
  },
  groupPopupFun() {
    this.setData({
      groupPopup: false
    })
  },
  groupBtn(e) {
    let idx = e.currentTarget.dataset.idx;
    let Ongoing = this.data.Ongoing;
    this.setData({
      participate: true,
      groupPopup: false,
      leftoverIdx: idx,
      leftoverQuota: Ongoing[idx].participateNum,
      participateDetails: Ongoing[idx].participateDetails,
      spellId: Ongoing[idx].spellId
    })
  },
  participateFun() {
    this.setData({
      participate: false
    })
  },
  getDetail() {
    let that = this;
    let parameter = {
      activityId: that.data.activityId,
      token: app.util.token,
    };
    app.http.post_from('/spell/anon/getActivityDetails', parameter).then(res => { //获取夺宝信息
      let res_data = res.data.res_data;
      let Ongoing = res_data.Ongoing;
      if (!Ongoing) {
        Ongoing = []
      }
      let len = Ongoing.length;
      let endDateList = [];
      for (let i = 0; i < len; i++) {
        Ongoing[i].participateNum = res_data.num - Ongoing[i].participateNum;
        let endDate = Ongoing[i].endDate
        endDateList.push(endDate)
      }
      res_data.rulesArr = res_data.rules.split('\r\n').map(o => {
        if (o.indexOf('u') != -1) {
          o = o.substr(1)
        }
        return o;
      });

      if (endDateList.length > 0) {
        that.data.time = setInterval(function () {
          for (var i in endDateList) {
            let endDate = endDateList[i];
            let nowTime = new Date().getTime();
            let s;
            if (endDate - nowTime > 0) {
              s = endDate - nowTime;
            }
            s = s - 1000; //时间差
            let day = Math.floor(s / 86400000);
            let hour = Math.floor(s / 3600000);
            let min = Math.floor((s / 60000) % 60);
            let sec = Math.floor((s / 1000) % 60);
            hour = hour < 10 ? "0" + hour : hour;
            min = min < 10 ? "0" + min : min;
            sec = sec < 10 ? "0" + sec : sec;
            let format = "";
            if (day > 0) {
              format = `${hour}:${min}:${sec}`;
            }
            if (day <= 0 && hour > 0) {
              format = `${hour}:${min}:${sec}`;
            }
            if (day <= 0 && hour <= 0) {
              format = `${"00"}:${min}:${sec}`;
            }
            if (day <= 0 && hour <= 0 && min <= 0 && sec <= 0) { //结束
              day = '0';
              hour = '00';
              min = '00';
              sec = '00';
              clearInterval(that.data.time)
            }
            Ongoing[i].endDate = format;
            that.setData({
              Ongoing: Ongoing,
            })
          }
        }, 1000);
      }

      res_data.spellPrice = app.util.strings(res_data.spellPrice);
      res_data.goodsPrice = app.util.strings(res_data.goodsPrice);
      let element = res_data.shopStoreLogo;
      let t = app.util.formatImg(element)
      res_data.shopStoreLogo = t; //图片格式化

      res_data.good = {
        image: res_data.image,
        price: res_data.spellPrice
      }
      that.setData({
        res_data: res_data,
        goodsId: res_data.goodsId,
        len: len
      })
    }).catch(e => {
      console.log(e);
    })
  },
  ruleFun() {
    this.setData({
      explain: true
    })
  },
  getProductList(state) {
    if (state) {
      console.log('商品ID', this.data.res_data.Ongoing[0].spellId)
      this.setData({
        spellId: this.data.res_data.Ongoing[0].spellId
      })
    }
    let url = "/goods/anon/queryProductList"
    let params = {
      goodsId: this.data.res_data.goodsId,
    };
    app.http.post_from(url, params).then(o => {
      let data = this.data.res_data;
      data.goodsSpecList = o.data.res_data.goodsSpecList;
      data.productList = o.data.res_data.productList;
      data.good = o.data.res_data;
      data.good.price = data.spellPrice
      data.good.image = data.image
      this.setData({
        data: data,
        activityId: this.data.res_data.activityId,
        show: true,
      })
    })
  },
  showFooterBuy(e) { //显示选规格弹窗
    console.log('参与拼团', e)
    let state = e.currentTarget.dataset.state;
    this.getProductList(state);
  },
  closeRuleFun() {
    this.setData({
      explain: false
    })
  },
  collectionFun() { //收藏
    let that = this;
    let collection = that.data.collection;
    console.log('活动ID',that.data.res_data)
    let parameter = {
      currencyId: that.data.res_data.activityId,
      flag: collection,
      goodsType: 2,
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
  serviceFun() { //客服
    app.serviceFun();
  },
})