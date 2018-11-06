var app = getApp()
Component({
  properties: {},
  data: {
    code: '',
    hasUserInfo: false,
    phoneNum: '',
    passcode: '', //验证码，我自创的单词
    timeout: 0,
  },
  methods: {
    getUserinfo(o) {
      console.log(o);
      let url = "basics/anon/appWxAuth";

      let params = {
        code: this.data.code,
        encryptedData: o.detail.encryptedData,
        iv: o.detail.iv,
        reqType: 4
      }
      console.log(JSON.stringify(params));
      app.http.post_from(url, params).then(o => {
        console.log('data', o);
        if (o.data.resData) { //如果是已注册用户就保存用户信息
        } else { //弹出绑定手机弹窗
          this.setData({
            hasUserInfo: false
          })
        }
      })

      //父页面调用组件的方法，写在这里方便复制
      // this.bindingPhone = this.selectComponent("#bingdingPhone");
      // this.bindingPhone.bingding() 

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
        timeout: 50,
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
  },
  created() {
    var that = this;
    wx.login({
      success(o) {
        console.log(o)
        that.data.code = o.code;
      }
    })
  }
});