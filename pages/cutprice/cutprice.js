let app = getApp()
Page({
  data: {
    animationData: {},
    setInter: '',
    bargainCarouselMessage: 'bargain/anon/bargainCarouselMessage', //砍价商品列表轮播信息
    dataList: [],
    bargainGoods: 'bargain/anon/bargainGoodsList', //砍价列表数据
    bargainGoodsList: [],
    shopIcon: true,
    mybarIcon: false,
    Box: true,
    bargainOrder: 'bargain/bargainOrderList', //砍价订单列表
    bargainOrderList: [],
    time: '',
    launchBox: false,
    showFooterBuy: false,
    data: {},
  },
  showFooterBuy(e) {
    let item = e.currentTarget.dataset.item;
    this.queryProduct(item);
  },
  queryProduct(item) {
    let url = '/goods/anon/queryProductList';
    let params = {
      goodsId: item.goodsId,
    }
    app.http.post_from(url, params).then(o => {
      let data = o.data.res_data;
      data.good = item;
      data.good.image = data.good.goodsImage
      this.setData({
        data,
        bargainId: item.bargainId,
        showFooterBuy: true,
      });

    })

  },
  onShow() {
    this.cut();
    var animation = wx.createAnimation({
      timingFunction: "linear",
      delay: 0
    })
    animation.translateX(375).step({
      delay: 0,
      duration: 0
    })
    this.setData({
      Box: true,
      shopIcon: true,
      mybarIcon: false,
      animationData: animation.export(),
    })
  },
  onHide() {
    clearInterval(this.data.time)
    clearInterval(this.data.setInter)
  },
  onUnload() {
    clearInterval(this.data.time) //清除倒计时
    clearInterval(this.data.setInter) //清除无缝滚动
  },
  cut() {
    var that = this;
    let Listparameter = {
      pageNo: 0,
      pageSize: 0,
    }
    app.http.post_from(that.data.bargainGoods, Listparameter).then(res => { //获取列表数据
      let bargainDataList = res.data.res_data.dataList;
      for (let i = 0; i < bargainDataList.length; i++) {
        bargainDataList[i].goodsPrice = app.util.strings(bargainDataList[i].goodsPrice);
        let element = bargainDataList[i].image;
        let t = app.util.formatImg(element)
        bargainDataList[i].image = t; //图片格式化
      }
      that.setData({
        bargainGoodsList: bargainDataList,
        lists: bargainDataList.length
      })
    }).catch(e => {
      console.log(e);
    })

    let parameter = {
      pageNo: 0,
      pageSize: 20,
    }
    app.http.post_from(that.data.bargainCarouselMessage, parameter).then(res => { //获取轮播数据
      let dataList = res.data.res_data.dataList;
      that.setData({
        dataList: dataList
      })

      var animation = wx.createAnimation({
        timingFunction: "linear",
        delay: 0
      })
      var query = wx.createSelectorQuery();
      query.select('.marquee_text').boundingClientRect(function(rect) {
        that.setData({
          length: parseInt(rect.width * (dataList.length + 2))
        })
        var length = that.data.length; //文字长度

        animation.translateX(-length).step({
          duration: 100000
        }).translateX(375).step({
          delay: 0,
          duration: 0
        })
        that.setData({
          animationData: animation.export(),
        })
        that.data.setInter = setInterval(function() {
          animation.translateX(-length).step({
            delay: 0,
            duration: 100000
          }).translateX(375).step({
            delay: 0,
            duration: 0
          })
          that.setData({
            animationData: animation.export()
          })
        }, 100100)

        wx.hideLoading();
      }).exec();

    }).catch(e => {
      console.log(e);
    })
  },
  onLoad(options) {
    this.mycut()
  },
  mycut() {
    var that = this;
    let Orderparameter = {
      pageNo: 0,
      pageSize: 0,
      token: app.util.token
    }
    app.http.post_from(that.data.bargainOrder, Orderparameter).then(res => { //获取我的砍价数据
      let rows = res.data.res_data.bargainOrderList.rows;

      let gettime = new Date().getTime();
      let endDateList = [];
      console.log(1111111111)

      rows = rows.map(o => {
        o.goodsPrice = app.util.strings(o.goodsPrice);
        o.image = app.util.formatImg(o.image)

        endDateList.push(o.takeDate)

        if (o.surplusPrice == 0) { //还剩0元
          o.takeDate = '已'
        }

        let gettime2 = new Date().getTime();
        if (o.takeDate - gettime2 < 0) {
          o.takeDate = '已'
          o.bargainOrderStatus = 9;//已结束，后台没返回就自己提供
        }

        return o;
      })
      
      that.setData({
        bargainOrderList: rows
      })

      endDateList = endDateList.slice(0, that.data.lists)

      if (endDateList.length > 0) {
        that.data.time = setInterval(function() {
          for (var i in endDateList) {
            let endDate = endDateList[i];
            let gettime2 = new Date().getTime();
            let s;
            let barList = 'bargainOrderList[' + i + '].takeDate';
            if (endDate - gettime2 > 0) {
              s = endDate - gettime2;
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
                format = `${hour}:${min}:${sec}` + '后';
              }
              if (day <= 0 && hour > 0) {
                format = `${hour}:${min}:${sec}` + '后';
              }
              if (day <= 0 && hour <= 0) {
                format = `${"00"}:${min}:${sec}` + '后';
              }
              if (day <= 0 && hour <= 0 && min <= 0 && sec <= 0) { //结束
                format = `已`;
              }
              that.setData({
                [barList]: format,
                launchBox: true
              })
            }
          }
        }, 1000);
      }
    }).catch(e => {
      console.log(e);
    })
  },
  cutpriceNavFun(res) {
    let that = this;
    let id = res.currentTarget.dataset.id;
    var shopIcon = that.data.shopIcon;
    var mybarIcon = that.data.mybarIcon;
    var Box = that.data.Box;
    if (id == "nav1") {
      clearInterval(this.data.time)
      shopIcon = true;
      mybarIcon = false;
      Box = true;
    } else {
      shopIcon = false;
      mybarIcon = true;
      Box = false;
      if (that.data.bargainOrderList == '' || that.data.time != '') {
        that.mycut();
      }

      that.setData({
        launchBox: false
      })
    }
    that.setData({
      shopIcon: shopIcon,
      mybarIcon: mybarIcon,
      Box: Box
    })
    console.log('离开了', that.data.bargainOrderList)
  },
  jump(e) {
    var idx = e.currentTarget.dataset.idx;
    let parameter = {
      token: app.util.token,
      bargainId: this.data.bargainGoodsList[idx].bargainId
    }
    app.http.post_from('bargain/createBargainOrder', parameter).then(res => { //获取列表数据
      if (res.data.res_code == 0) {
        let orderid = res.data.res_data.bargainGoods.orderId
        wx.navigateTo({
          url: '/pages/cutpriceDetails/cutpriceDetails?orderid=' + orderid
        })
      } else {
        wx.showToast({
          title: res.data.res_info,
          icon: 'none',
          duration: 1200
        })
      }
    }).catch(e => {
      console.log(e);
    })
  },
  jump2(e) {
    let idx = e.currentTarget.dataset.idx;
    let orderid = this.data.bargainOrderList[idx].bargainOrderId;
    wx.navigateTo({
      url: '/pages/cutpriceDetails/cutpriceDetails?orderid=' + orderid
    })
  },
  jump3(e) { //查看物流
    let idx = e.currentTarget.dataset.idx;
    let orderid = this.data.bargainOrderList[idx].bargainOrderId;
    let image = this.data.bargainOrderList[idx].image
    let href = "/pages/logistics/logistics?type=4&orderId=" + orderid + "&face=" + image
    wx.navigateTo({
      url: href,
    })
  },
  jump4(e) { //确认收货
    var that = this;
    wx.showModal({
      title: '提示',
      content: '是否确认收货',
      success() {
        let idx = e.currentTarget.dataset.idx;
        let orderid = that.data.bargainOrderList[idx].bargainOrderId;
        let url = '/bargain/bargainOrderRog';
        let params = {
          orderId: orderid,
          token: app.util.token,
        }
        app.http.post_from(url, params).then(o => {
          if (o.data.res_code == 0) {
            that.mycut();
          }
          wx.showModal({
            title: '提示',
            content: o.data.res_info,
            showCancel: false,
          })
        })
      }
    })

  }
})