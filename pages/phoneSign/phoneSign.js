var app = getApp()
Page({
  data: {
    state: 0,
    count: '获取验证码',
    text: '密码登录',
    register: false,
    code: '',
    mobile: '',
    password: '',
    countState: true,
    typeState: 7,
    code2: '',
    hasUserInfo: false,
    phoneNum: '',
    passcode: '', //验证码，我自创的单词
    timeout: 0,
    timefun: ''
  },
  onLoad: function(options) {
    // console.log('基督教',options)
    this.setData(options)
    // console.log('店长ID', this.data.id)

    var that = this;
    wx.login({
      success(o) {
        that.data.code2 = o.code;
      }
    })
  },
  getUserinfo(o) {
    console.log('o', o)
    let url = "basics/anon/appWxAuth";
    this.data.rawData = JSON.parse(o.detail.rawData);
    let params = {
      code: this.data.code2,
      encryptedData: o.detail.encryptedData,
      iv: o.detail.iv,
      reqType: 4
    }
    console.log('允许授权', JSON.stringify(params));
    app.http.post_from(url, params).then(o => {
      console.log('data', o);
      if (o.data.res_data.member) { //如果是已注册用户就保存用户信息
        if (!o.data.res_data.member.mobile) {
          this.setData({
            hasUserInfo: true
          })
          return
        }
        app.util.token = o.data.res_data.token;
        if (!o.data.res_data.member.face) { //如果后台没有返回头像，就用微信头像吧
          o.data.res_data.member.face = this.data.rawData.avatarUrl
        }
        app.util.userInfo = o.data.res_data.member
        wx.setStorageSync('userInfo', JSON.stringify(app.util.userInfo))
        wx.setStorageSync('token', app.util.token)
        this.goback();
      } else { //弹出绑定手机弹窗
        this.setData({
          userInfo: {
            authType: 1,
            face: this.data.rawData.avatarUrl, //微信头像
            nickname: this.data.rawData.nickName,
            memberStatus: 0,
            sex: o.data.res_data.sex,
            subscribe: o.data.res_data.subscribe,
            openId: o.data.res_data.openId,
            type: 8,
            unionId: o.data.res_data.unionId,
          },
          hasUserInfo: true
        })
      }
    })
  },
  goback() {
    wx.navigateBack({

    })
  },
  binding() {
    console.log('binding', this.data.phoneNum)
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
    params = Object.assign(userInfo, params);
    if (wx.getStorageSync('memberId')) {
      params.parentId = wx.getStorageSync('memberId')
    }
    app.http.post_from(url, params).then(o => {
      console.log(o)
      wx.showModal({
        title: '提示',
        content: o.data.res_info,
        showCancel: false,
      })
      if (o.data.res_code == 0) {
        app.util.userInfo = o.data.res_data.member
        app.util.token = o.data.res_data.token
        wx.setStorageSync('userInfo', JSON.stringify(app.util.userInfo))
        wx.setStorageSync('token', app.util.token);
        this.goback();
      }
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
      timeout: 50,
    })
    let that = this;
    this.data.timefun = setInterval(function() {
      if (that.data.timeout > 0) {
        that.setData({
          timeout: that.data.timeout - 1,
        })
      } else {
        clearTimeout(this.data.timefun);
      }
    }, 1000)
    let params = {
      mobile: this.data.phoneNum,
      type: 1
    }
    app.http.post_from(url, params).then(o => {
      if (o.data.res_code == 0) {
        wx.showToast({
          title: o.data.res_info,
          icon: 'none',
          duration: 1200
        })
      } else {
        wx.showModal({
          title: '提示',
          content: o.data.res_info,
          showCancel: false,
        })
        this.setData({
          timeout: 0,
        })
        clearTimeout(this.data.timefun);
      }
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
  onUnload() {
    clearInterval(this.data.t)
    clearTimeout(this.data.timefun);
  },
  onHide() {
    clearInterval(this.data.t)
    clearTimeout(this.data.timefun);
  },
  bindBoxBgFun() {
    return;
    this.setData({
      hasUserInfo: false
    })
  },
  count() { //获取验证码
    let that = this;
    let countState = that.data.countState;
    let mobile = that.data.mobile;
    let myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    if (countState) {
      that.setData({
        countState: false
      })
      let parameter = {
        mobile: mobile,
        type: that.data.typeState,
      }
      if (mobile == '' || !myreg.test(mobile)) {
        wx.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        })
        that.data.countState = true;
      } else {
        app.http.post_from('/basics/anon/sendMobileCode', parameter).then(res => {
          wx.showToast({
            title: res.data.res_info,
            icon: 'none'
          })
          if (res.data.res_code == 0) {
            console.log(res.data)
            let count = that.data.count = 60;
            count--
            that.setData({
              count: count + 's'
            })
            that.data.t = setInterval(function() {
              console.log(countState)
              if (that.data.countState) {
                clearInterval(that.data.t);
                return false
              }
              count--
              that.setData({
                count: count + 's'
              })
              if (count < 0) {
                clearInterval(that.data.t);
                that.setData({
                  count: '获取验证码',
                  countState: true,
                })
              }
            }, 1000)

          }
        }).catch(e => {
          this.data.countState = true;
          console.log(e);
        })
      }
    }
  },
  signCodeBtn(e) { //验证码登录
    let that = this;
    let id = e.currentTarget.dataset.id;
    let code = that.data.code;
    let mobile = that.data.mobile;
    let password = that.data.password;
    let parameter;
    let url;

    if (id == 1) {
      url = 'basics/anon/checkCodeLogin';
      parameter = {
        code: code,
        mobile: mobile,
        type: 7,
      }
    } else if (id == 2) {
      console.log('开机', wx.getStorageSync('memberId'))
      url = 'basics/anon/memberRegister';
      parameter = {
        code: code,
        mobile: mobile,
        password: password,
        type: 1,
        memberId: wx.getStorageSync('memberId')
      }
    }

    if (code == '') {
      wx.showToast({
        title: '验证码不能为空',
        icon: 'none'
      })
    } else {
      app.http.post_from(url, parameter).then(res => {
        wx.showToast({
          title: res.data.res_info,
          icon: 'none'
        })
        if (res.data.res_code == 0) {
          if (id == 1) {
            app.util.userInfo = res.data.res_data.member;
            app.util.token = res.data.res_data.token;
            wx.setStorageSync('userInfo', JSON.stringify(app.util.userInfo))
            wx.setStorageSync('token', app.util.token)
            wx.switchTab({
              url: '/pages/mine/index',
            })
          } else if (id == 2) {
            clearInterval(that.data.t)
            let state = that.data.state;
            that.setData({
              state: 0,
              text: '密码登录',
              count: '获取验证码',
              register: false,
            })
          }
          console.log('都是', id)
          console.log('而我', res.data.res_info)
        }
      }).catch(e => {
        console.log(e);
      })
    }
  },
  registerBtn() { //进入注册页面
    this.setData({
      state: -1,
      countState: true,
      count: '获取验证码',
      register: true,
      typeState: 1
    })
  },
  passwordSign() { //进入密码登录
    let state = this.data.state;
    if (state == 0) {
      this.setData({
        state: 1,
        text: '验证码登录'
      })
    } else if (state == 1) {
      this.setData({
        state: 0,
        text: '密码登录'
      })
    }
  },
  signpassword() { //密码登录
    let that = this;
    let mobile = that.data.mobile;
    let password = that.data.password;

    if (mobile == '' || password == '') {
      wx.showToast({
        title: '手机号或密码不能为空',
        icon: 'none'
      })
    } else {
      password
      let parameter = {
        password,
        uname: mobile
      }
      app.http.post_from('basics/onLogin', parameter).then(res => {
        wx.showToast({
          title: res.data.res_info,
          icon: 'none'
        })
        if (res.data.res_code == 0) {
          app.util.userInfo = res.data.res_data.member;
          app.util.token = res.data.res_data.token;
          wx.setStorageSync('userInfo', JSON.stringify(app.util.userInfo))
          wx.setStorageSync('token', app.util.token)
          wx.setStorageSync('saveTime', Date.parse(new Date())); //存储登录时间，用于防止openId过期
          wx.switchTab({
            url: '/pages/mine/index',
          })
        }
      }).catch(e => {
        console.log(e);
      })
    }
  },
  lastStep() { //上一步
    this.setData({
      state: 0,
      countState: true,
      count: '获取验证码',
      register: false,
      typeState: 7
    })
  },
  codes(e) {
    console.log(e.detail.value)
    let code = e.detail.value;
    this.setData({
      code
    })
  },
  mobile(e) {
    let mobile = e.detail.value;
    this.setData({
      mobile
    })
  },
  password(e) {
    let password = e.detail.value;
    this.setData({
      password
    })
  }
})