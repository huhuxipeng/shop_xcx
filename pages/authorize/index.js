
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    code2: '',
    hasUserInfo: false,
    phoneNum: '',
    passcode: '', //验证码，我自创的单词
    timeout: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    wx.login({
      success(o) {
        console.log(o)
        that.data.code2 = o.code;
      }
    })
  },
  getUserinfo(o) {
    console.log(o);
    let url = "basics/anon/appWxAuth";
    this.data.rawData = JSON.parse(o.detail.rawData);
    let params = {
      code: this.data.code2,
      encryptedData: o.detail.encryptedData,
      iv: o.detail.iv,
      reqType: 4
    }
    console.log(JSON.stringify(params));
    app.http.post_from(url, params).then(o => {
      console.log('data', o);
      if (o.data.res_data) { //如果是已注册用户就保存用户信息
        app.util.token = o.data.res_data.token;
        if (!o.data.res_data.member.face){//如果后台没有返回头像，就用微信头像吧
          o.data.res_data.member.face = this.data.rawData.avatarUrl
        }
        app.util.userInfo = o.data.res_data.member
        wx.setStorageSync('userInfo', JSON.stringify(app.util.userInfo))
        wx.setStorageSync('token', app.util.token)
        this.goback();
      } else { //弹出绑定手机弹窗
        this.setData({
          hasUserInfo: false
        })
      }
    })
  },
  goback() {
    wx.navigateBack({

    })
  },
  binding() {
    if (!app.util.check(this.data.phoneNum, 'phone')) {
      return;
    }
    if (!this.data.passcode) {
      wx.showModal({
        title: '提示',
        content: '验证码不能为空！',
        showCancel: false,
      })
      return
    }
    let userInfo = this.data.userInfo
    let url = "basics/anon/loginAuthorizedCode";
    let params = {
      authType: 1,
      mobile: this.data.phoneNum,
      mobileCode: this.data.passcode
    }
    console.log('userInfo', userInfo);
    params = Object.assign(userInfo, params);
    console.log('params', params);
    app.http.post_from(url, params).then(o => {
      console.log(o)
    }).catch(e => {

    })
  },

  cancel() {
    this.setData({
      hasUserInfo: true
    })
  },
  sendCode() {
    let url = "basics/anon/sendMobileCode";

    if (!app.util.check(this.data.phoneNum, 'phone')) {
      return;
    }
    this.setData({
      timeout: 5,
    })
    let that = this;
    let timefun = setInterval(function() {
      if (that.data.timeout > 0) {
        that.setData({
          timeout: that.data.timeout - 1,
        })
      } else {
        clearTimeout(timefun);
      }
    }, 1000)
    let params = {
      mobile: this.data.phoneNum
    }
    app.http.post_from(url, params).then(o => {
      console.log(o);
    }).catch(e => {
      console.log(e)
    })
  },
  changeValue(e) {
    console.log(e);
    let options = {};
    options[e.target.dataset.prop] = e.detail.value
    this.setData(options);
    console.log(this.data.phoneNum)
  },
  
  
})