// components/payAction/index.js
var app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    payOptions: {
      type: Object,
      value: {},
    },
    orderId: {
      type: String,
      value: '',
    },
    spellId: {
      type: String,
      value: '',
    },
    bargainId: {
      type: String,
      value: '',
    },
    isInvite: {
      type: Boolean,
      value: false,
    },
    flashsaleId: {
      type: String,
      value: '',
    },
    show: {
      type: Boolean,
      value: false,
      observer(newVal) {
        console.log(newVal)
        this.setData({
          actionSheetShow: newVal
        })
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    actionSheetShow: false,
    showPasswordPopup: false,
    actionSheetItems: ['预付款', '微信支付']
  },
  /**
   * 组件的方法列表
   */
  methods: {
    cancelPay() { //取消支付
      this.setData({
        show: false,
        showPasswordPopup: false,
      })
    },
    paySuccess() {
      var that = this;
      wx.showModal({
        title: '提示',
        content: '支付成功',
        showCancel: false,
        success() {
          that.setData({
            showPasswordPopup: false,
          })
          if (that.data.spellId) { //如果是拼团
            wx.navigateTo({
              url: '../../pages/groupTime/index?orderId=' + that.data.orderId + '&spellId=' + that.data.spellId
            })
          } else if (that.data.flashsaleId) { //如果是限时抢购
            wx.navigateTo({
              url: '../../pages/orderDetail/index?orderId=' + that.data.orderId + '&orderType=1'
            })
          } else if (that.data.bargainId) { //砍价订单
            wx.navigateTo({
              url: '../../pages/cutpriceDetails/cutpriceDetails?orderId=' + that.data.orderId
            })
          } else {
            wx.navigateTo({
              url: '../../pages/orderDetail/index?orderId=' + that.data.orderId
            })
          }
        },
      })
    },
    payByPassword() { //确定余额支付
      if (!app.util.userInfo.payPassword) { //如果没有支付密码
        var that = this;
        wx.showModal({
          title: '提示',
          content: '未设置支付密码，是否跳转到支付密码设置页面',
          success(o) {
            console.log('o', o);
            if (o.confirm) {
              wx.navigateTo({
                url: '/pages/setUp/setUp?id=3&needBack=true',
              })
            } else {
              that.cancelPay();
            }
          }
        })
        return;
      }
      let url = '/pay/orderPay'
      if (this.data.spellId) { //如果是拼团订单
        url = '/pay/spellOrderPay'
      }
      if (this.data.flashsaleId) { //限时抢购订单
        url = '/pay/flashsaleOrderPay'
      }
      if (this.data.bargainId) { //砍价订单
        url = '/pay/bargainOrderPay'
      }
      console.log(this.data)
      let params = {
        token: app.util.token,
        payPwd: this.data.password,
        orderId: this.data.orderId,
        payType: 0,
        reqType: 0
      }
      console.log('数据', this.data.payOptions)
      app.http.post_from(url, params).then(o => {
        console.log(o)
        if (o.data.res_code == 0) { //支付成功
          this.paySuccess()
        } else {
          wx.showModal({
            title: '提示',
            content: o.data.res_info,
            showCancel: false,
          })
        }
      }).catch(e => {
        console.log(url, e)
      })
    },
    changeValue(e) {
      let options = {};
      options[e.target.dataset.prop] = e.detail.value
      this.setData(options);
    },
    actionSheetTap: function(e) {
      this.setData({
        actionSheetHidden: !this.data.actionSheetHidden
      })
    },
    actionSheetChange: function(e) {
      this.setData({
        actionSheetHidden: !this.data.actionSheetHidden
      })
    },
    openWxpay(payInfo) { //唤起微信支付
      var that = this;
      let params = {
        success(o) {
          if (that.data.spellId) { //如果是拼团
            wx.navigateTo({
              url: '../../pages/groupTime/index?orderId=' + that.data.orderId + '&spellId=' + that.data.spellId
            })
          } else if (that.data.flashsaleId) { //如果是限时抢购
            wx.navigateTo({
              url: '../../pages/orderDetail/index?orderId=' + that.data.orderId + '&orderType=1'
            })
          } else if (that.data.bargainId) { //砍价订单
            wx.navigateTo({
              url: '../../pages/cutpriceDetails/cutpriceDetails?orderId=' + that.data.orderId
            })
          } else {
            wx.navigateTo({
              url: '../../pages/orderDetail/index?orderId=' + that.data.orderId
            })
          }
        },
        fail(o) {
          wx.showModal({
            title: '提示',
            content: '支付失败',
            showCancel: false,
          })
        },
        complete(o) {
          console.log(o)
        },
      }
      if (!payInfo.paySign) { //随便拿个字段来判断成功失败
        console.log('error', payInfo)
        wx.showModal({
          title: '提示',
          content: payInfo.message,
          showCancel: false,
        })
        return;
      }

      payInfo = Object.assign(params, payInfo);
      console.log('payInfo',payInfo);
      wx.requestPayment(payInfo)

    },
    bindItemTap: function(e) {
      if (e.currentTarget.dataset.name == "微信支付") {
        let pages = getCurrentPages(); //页面数组
        let prevPage = pages[pages.length - 1]; //父页面
        prevPage.setData({
          showPayAction: false
        })
        let that = this;
        wx.login({
          success(o){
            let url = 'basics/anon/spgWxAuth'
            let params = {
              code:o.code
            }
            app.http.post_from(url,params).then(o=>{
              if(o.data.res_code==0){
                that.getWxPayOptions(o.data.res_data.openId)
              }
            }).catch(e=>{

            })
          }
        })
        
      } else {
        let pages = getCurrentPages(); //页面数组
        let prevPage = pages[pages.length - 1]; //父页面
        prevPage.setData({
          showPayAction: false
        })
        this.setData({
          showPasswordPopup: true,
        })
      }
    },
    getWxPayOptions(openId){
      let url = '/pay/jyPay';
      let params = {
        openId,
        reqType: 4,
        orderId: this.data.orderId,
        token: app.util.token,
        payWay: '01',
        payType: '09',
      }
      if (this.data.spellId) { //如果是拼团
        // params.orderType = 5 //如果后面改成聚合支付，就取消注释这行，注释下面的部分
        let url = '/pay/spellOrderPay' //旧版微信支付
        params = {
          orderId: this.data.orderId,
          payType: '4',
          reqType: '4',
          token: app.util.token,
        }
        app.http.post_from(url, params).then(o => {
          let payInfo = JSON.parse(o.data.res_data.payInfo)
          this.openWxpay(payInfo)
        })
        return;
      } else if (this.data.flashsaleId) { //如果是限时抢购
        params.orderType = 7
      } else if (this.data.bargainId) { //砍价订单
        params.orderType = 4
      } else { //普通订单
        params.orderType = 0
      }
      app.http.post_from(url, params).then(o => {
        console.log('o', o)
        // let payInfo;
        // if (typeof (o.data.res_data.payInfo) == 'object') {
        //   payInfo = o.data.res_data.payInfo
        // } else {
        //   payInfo = JSON.parse(o.data.res_data.payInfo)
        // }
        this.openWxpay(o.data)

        return;
        if (!payInfo) {
          wx.showModal({
            title: '提示',
            content: o.data.message ? o.data.message : o.data.respMsg,
            showCancel: false,
          })
          return;
        }
        wx.setStorageSync('payInfo', payInfo)
        let orderType = 0;
        if (this.data.flashsaleId) {
          orderType = 1;
        } else if (this.data.bargainId) {
          wx.navigateTo({
            url: '/pages/webview/index?payInfo=true&orderId=' + this.data.orderId + '&bargainId=' + this.data.bargainId
          });
          return;
        } else if (this.data.spellId) {
          wx.navigateTo({
            url: '/pages/webview/index?payInfo=true&orderId=' + this.data.orderId + '&spellId=' + this.data.spellId
          });
          return;
        }
        wx.navigateTo({
          url: '/pages/webview/index?payInfo=true&orderId=' + this.data.orderId + '&orderType=' + orderType
        });
      }).catch(e => {
        console.log(e)
      })
    }
  }
})