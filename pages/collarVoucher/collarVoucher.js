var app = getApp()
Page({
  data: {
    shareState: false,
    receiveState: false,
    CodeText: '获取验证码',
    countState: true,
    mobile: '',
    code: '',
    mold: '0',
    sn: ''//9trso443测试券码
  },
  onLoad(options){
    if (options.mold) {
      this.setData({
        mold: options.mold
      })
    }
    if (options.o_coupon_cpnId) {
      this.setData({
        o_coupon_cpnId: options.o_coupon_cpnId
      })

      let parame = {
        cpnId: this.data.o_coupon_cpnId,
      }
      app.http.post_from('coupon/anon/queryCouponDetail', parame).then(res => {
        let o = res.data.res_data.coupon;
        o.getBeginTime = new Date(o.getBeginTime).format("yyyy.MM.dd");
        o.getEndTime = new Date(o.getEndTime).format("yyyy.MM.dd");
        o.shareImg = app.util.formatImg(o.shareImg);
        switch (o.cpnType) {
          case 0:
            o.cpnTypes = '分类券'
            break;
          case 1:
            o.cpnTypes = '商品券'
            break;
          case 2:
            o.cpnTypes = '店铺券'
            break;
          case 3:
            o.cpnTypes = '通用券'
            break;
        }
        this.setData({
          couponList: o
        })
      })
    }
    if (options.sn) {
      this.setData({
        sn: options.sn
      })
    }
    if (options.cpnId) {
      this.setData({
        cpnId: options.cpnId
      })
    }
  },
  receiveFun(){
    let [code,mobile]=[this.data.code,this.data.mobile];
    let parameter={
      code: code,
      mobile: mobile,
      type: 7,
    }
    if (mobile == '') {
      wx.showToast({
        title: '请输入手机号码',
        icon: 'none'
      })
    }else if (code == '') {
      wx.showToast({
        title: '请输入验证码',
        icon: 'none'
      })
    }else{
      app.http.post_from('basics/anon/checkCodeLogin', parameter).then(res => {
        let that = this;
        if(res.data.res_code==0){
          wx.setStorageSync('token', res.data.res_data.token)
          wx.setStorageSync('userInfo', JSON.stringify(res.data.res_data.member))
          let token = res.data.res_data.token;
          if (that.data.mold=='0'){//普通领取
            let parameter = {
              cpnId: that.data.cpnId,
              token: token,
            }
            app.http.post_from('coupon/memberGetCoupon',parameter).then(res => {
              console.log('普通领取结果',res)
              if (res.data.res_code == 0) {//领取成功
                wx.showToast({
                  title: res.data.res_info,
                  icon: 'none'
                })
                that.setData({
                  receiveState: true
                })
              }else{
                wx.showToast({
                  title: res.data.res_info,
                  icon: 'none'
                })
              }
            })
          } else if (that.data.mold == '2'){//赠送
            let parameter = {
              cpnId: that.data.cpnId,
              sn: that.data.sn,
              token: token,
            }
            app.http.post_from('coupon/giveCoupon', parameter).then(res => {
              console.log('赠送领取结果', res)
              if (res.data.res_code == 0) {//领取成功
                wx.showToast({
                  title: res.data.res_info,
                  icon: 'none'
                })
                that.setData({
                  receiveState: true
                })
              } else {
                wx.showToast({
                  title: res.data.res_info,
                  icon: 'none'
                })
              }
            })
          }
        }else{
          wx.showToast({
            title: res.data.res_info,
            icon: 'none'
          })
        }
      })
    }
  },
  onShareAppMessage: function (e) { //数据分享
    let path = '/pages/collarVoucher/collarVoucher?cpnId=' + this.data.couponList.cpnId + '&o_coupon_cpnId=' + this.data.couponList.cpnId + '&mold=0'
    return {
      title: this.data.couponList.shareTitle,
      desc: this.data.couponList.shareRemark,
      path: path,
      imageUrl: this.data.couponList.shareImg,
      success: (res) => {
        console.log("转发成功", res);
      },
      fail: (res) => {
        console.log("转发失败", res);
      }
    }
  },
  shareGuide() {

  },
  closeShare() {
    this.setData({
      shareState: false
    })
  },
  inpFun(e){
    let mobile = e.detail.value;
    this.setData({
      mobile: mobile
    })
  },
  codeFun(e){
    let code = e.detail.value;
    this.setData({
      code: code
    })
  },
  onUnload() {
    clearInterval(this.data.t)
  },
  onHide() {
    clearInterval(this.data.t)
  },
  getCodeFun() {
    let countState = this.data.countState;
    let mobile = this.data.mobile;
    let myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    let parameter = {
      mobile: mobile,
      type: 7,
    }
    if (countState) {
      this.setData({
        countState: false
      })
      if (mobile == '' || !myreg.test(mobile)){
        wx.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        })
        this.setData({
          countState: true
        })
      }else{
        app.http.post_from('/basics/anon/sendMobileCode', parameter).then(res => {
          let that = this;
          wx.showToast({
            title: res.data.res_info,
            icon: 'none'
          })
          if (res.data.res_code == 0) {
            let count = that.data.CodeText = 60;
            count--
            that.setData({
              CodeText: count + 's'
            })
            that.data.t = setInterval(function () {
              if (that.data.countState) {
                clearInterval(that.data.t);
                return false
              }
              count--
              that.setData({
                CodeText: count + 's'
              })
              if (count < 0) {
                clearInterval(that.data.t);
                that.setData({
                  CodeText: '获取验证码',
                  countState: true
                })
              }
            }, 1000)
          }
        })
      }
    }
  },
  useFun(){
    app.util.showRelDetail(this.data.couponList);
  }
})