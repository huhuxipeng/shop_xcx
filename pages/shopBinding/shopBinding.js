var app = getApp()
Page({
  data: {
    selectAllStatus: false,
    count: '获取验证码',
    countState: true,
    inputValue: '',
    code: ''
  
  },
  nextStep(){
    let that = this;
    if (that.data.selectAllStatus){
      let parameter = {
        code: that.data.code,
        mobile: that.data.inputValue,
        token: app.util.token,
        type: 5,
      }
      app.http.post_from('member/checkCode', parameter).then(res => {
        console.log(res)
        if (res.data.res_code == 0) {
          wx.showModal({
            title: '提示',
            content: res.data.res_info,
            success: function (res) {
              if (res.confirm) {
                wx.navigateTo({
                  url: '/pages/shopoPayment/shopoPayment'
                })
              } else if (res.cancel) {
                wx.navigateTo({
                  url: '/pages/shopoPayment/shopoPayment'
                })
              }
            }
          })
        }else{
          wx.showModal({
            title: '提示',
            content: res.data.res_info,
          })
        }
        
      }).catch(e => {
        console.log(e);
      })
    }
  },
  getCount(){
    let that = this;
    let inputValue = that.data.inputValue;
    var phoneReg = /(^1[3|4|5|7|8]\d{9}$)|(^09\d{8}$)/;
    let countState = that.data.countState;
    if (inputValue == '' || !phoneReg.test(inputValue)) {
      wx.showToast({
        title: '手机号不正确',
        icon: 'none',
        duration: 1200
      })
    } else {
      if (countState) {
        that.setData({
          countState: false
        })
        let parameter = {
          mobile: inputValue,
          token: app.util.token,
          type: 5,
        }
        app.http.post_from('member/mobileCheck', parameter).then(res => {
          let count = that.data.count = 60;
          count--
          that.setData({
            count: count + 's'
          })
          let t = setInterval(function () {
            if (that.data.Box) {
              clearInterval(t);
            }
            count--
            that.setData({
              count: count + 's'
            })
            if (count < 0) {
              clearInterval(t);
              that.setData({
                count: '获取验证码',
                countState: true
              })
            }
          }, 1000)
        }).catch(e => {
          console.log(e);
        })
      }
    }
  },
  selectAll() {
    let selectAllStatus = this.data.selectAllStatus;
    selectAllStatus = !selectAllStatus;
    this.setData({
      selectAllStatus: selectAllStatus
    })
  },
  agreement() {//店长协议
    wx.navigateTo({
      url: '/pages/shopAgreement/shopAgreement'
    })
  },
  inputValue(e) {
    this.setData({
      inputValue: e.detail.value
    })
  },
  code(e) {
    this.setData({
      code: e.detail.value
    })
  },
  
})