var app = getApp()
Page({
  data: {
    Box: true,  //初始界面
    signPassword: false,
    new: false,
    paymentPassword: false,
    payPassword: false,
    forget: false,
    binding: false,
    inputValue: '',//手机号
    newPassword: '',//新密码
    surePassword: '',//确认密码
    verificationCode: '',//验证码
    paymentPrimary: '',//原密码
    count: '获取验证码',
    countState: true,
  },
  onShow(){
    if (this.data.noFirst) {
      this.getuser();
      return
    }
    this.data.noFirst = true;
  },
  onLoad(options) {
    this.setData(options)
    this.getuser();
  },
  getuser() {
    let that = this;
    let id = that.data.id;
    if (id == 1) {//忘记密码
      that.setData({
        Box: false,
        signPassword: true
      })
    } else if (id == 3) {//修改支付密码
      that.setData({
        Box: false,
        needBack: this.data.needBack,
        paymentPassword:true
      })
      that.paymentPassword();
    }
    let parameter = {
      token: app.util.token,
    }
    app.http.post_from('member/jifenyuetongji', parameter).then(res => {
      let member = res.data.res_data.member;
      let mobile = member.mobile;
      wx.setStorageSync('userInfo', JSON.stringify(member))
      app.util.userInfo= member;
      let decompose1 = mobile.substring(0, 3);
      let decompose2 = mobile.substr(mobile.length - 4);
      that.setData({
        decompose1: decompose1,
        decompose2: decompose2
      })
    }).catch(e => {
      console.log(e);
    })
  },
  signPassword(){//登录密码修改
    let that = this;
    that.setData({
      Box: false,
      signPassword: true,
      inputValue: '',//手机号
      newPassword: '',//新密码
      surePassword: '',//确认密码
      verificationCode: '',//验证码
      paymentPrimary: '',//原密码
      count: '获取验证码',
      countState: true
    })
  },
  obtainBtn() {//找回密码短信发送
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
      if (countState){
        that.setData({
          countState: false
        })
        let parameter={
          mobile: inputValue,
          type: 2,
        }
        app.http.post_from('member/anon/sendMobileCodeNoToken', parameter).then(res => {
          if(res.data.res_code==0){
            wx.showToast({
              title: res.data.res_info,
              icon: 'none',
              duration: 1200
            })
          }
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
  cachingFun(){//清除缓存
    wx.showLoading({
      title: '清除中',
    })
    setTimeout(function () {
      wx.hideLoading()
      wx.showToast({
        title: '清除成功',
        icon: 'success',
        duration: 1200
      })
    }, 2000)
  },
  nextStepFun(){//下一步
    let that = this;
    let inputValue = that.data.inputValue;
    let verificationCode = that.data.verificationCode;
    if (inputValue==''){
      wx.showToast({
        title: "未输入手机号码",
        icon: 'none',
        duration: 1200
      })
      return
    } else if (verificationCode == ''){
      wx.showToast({
        title: "未输入验证码",
        icon: 'none',
        duration: 1200
      })
      return
    }
    let parameter = {
      code: verificationCode,
      mobile: inputValue,
      type: 2
    }
    app.http.post_from('member/anon/checkCodeNoToken', parameter).then(res => {
      if(res.data.res_code==0){
        that.setData({
          signPassword: false,
          new: true
        })
      }else{
        wx.showToast({
          title: res.data.res_info,
        })
      }
    }).catch(e => {
      console.log(e);
    })
  },
  complete(){//完成
    let that = this;
    let newPassword = that.data.newPassword; 
    let surePassword = that.data.surePassword;
    let inputValue = that.data.inputValue;
    if (newPassword == surePassword) {
      if (newPassword.length > 5 && newPassword.length < 19) {
        let parameter = {
          mobile: inputValue,
          newpassword: newPassword
        }
        app.http.post_from('member/anon/resetLoginPassword', parameter).then(res => {
          //修改密码成功跳转到登录
          wx.showToast({
            title: '修改密码成功',
            icon: 'success',
            duration: 1200
          })
          that.setData({
            Box: true,
            new: false
          })
        }).catch(e => {
          console.log(e);
        })
      } else {
        wx.showToast({
          title: '密码(6-18位)',
          icon: 'none',
          duration: 1200
        })
      }
    } else {
      wx.showToast({
        title: '两次密码不一致',
        icon: 'none',
        duration: 1200
      })
    }

  },
  inputValue(e){
    this.setData({
      inputValue: e.detail.value
    })
  },
  verificationCode(e) {
    this.setData({
      verificationCode: e.detail.value
    })
  },
  newPassword(e) {
    this.setData({
      newPassword: e.detail.value
    })
  },
  surePassword(e) {
    this.setData({
      surePassword: e.detail.value
    })
  },
  paymentPassword() {//支付密码
    let that = this;
    let userInfo = JSON.parse(wx.getStorageSync('userInfo'));
    if (userInfo.payPassword!=null){
      that.setData({
        payPassword: true,
      })
    }
    that.setData({
      userInfo: userInfo,
      Box: false,
      paymentPassword: true,
      inputValue: '',//手机号
      newPassword: '',//新密码
      surePassword: '',//确认密码
      verificationCode: '',//验证码
      paymentPrimary: '',//原密码
      count: '获取验证码',
      countState: true
    })
  },
  PasswordComplete(){//修改支付密码完成
    let that = this;
    let paymentPrimary = that.data.paymentPrimary;
    let newPassword = that.data.newPassword;
    let surePassword = that.data.surePassword;
    let userInfo = that.data.userInfo;
    
    if (userInfo.payPassword != null) {
      if (paymentPrimary == "" || newPassword == "") {
        wx.showToast({
          title: '密码不能为空',
          icon: 'none',
          duration: 1200
        })
        return
      }
    }
    
    if (newPassword != surePassword) {
      wx.showToast({
        title: '两次密码输入不一致',
        icon: 'none',
        duration: 1200
      })
    }else{
      if (newPassword.length==6){
        if (userInfo.payPassword != null) {
          var parameter = {
            newPayPassword: newPassword,
            payPassword: paymentPrimary,
            token: app.util.token
          }
        }else{
          var parameter = {
            newPayPassword: newPassword,
            token: app.util.token
          }
        }
        
        app.http.post_from('member/updateMemberInfo', parameter).then(res => {
          var that = this;
          wx.showModal({
            title: '提示',
            content: res.data.res_info,
            success(){
              if (that.data.needBack){
                wx.navigateBack({
                })
              }
            },
            showCancel:false,
          })
          if(res.data.res_code==0){
            that.setData({
              Box: true,
              paymentPassword: false
            })
            that.getuser();
          }
        }).catch(e => {
          console.log(e);
        })
      }else{
        wx.showToast({
          title: '请设置六位数密码',
          icon: 'none',
          duration: 1200
        })
      }
    }
  },

  forgetFun() {//忘记原密码点击
    let that =this;
    that.setData({
      forget: true,
      paymentPassword: false
    })
  },
  paymentPrimary(e) {
    this.setData({
      paymentPrimary: e.detail.value
    })
  },
  forgetObtainFun() {//忘记原密码获取验证码
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
    }else{
      if (countState) {
        that.setData({
          countState: false
        })
        let parameter = {
          mobile: inputValue,
          token: app.util.token,
          type: 4,
        }
        app.http.post_from('member/mobileCheck', parameter).then(res => {
          if (res.data.res_code == 0) {
            wx.showToast({
              title: res.data.res_info,
              icon: 'none',
              duration: 1200
            })
          }
          let count = that.data.count = 60;
          //成功获取验证码
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
  forgetComplete() {//忘记原密码确认按钮
    let that =this;
    let inputValue = that.data.inputValue;//手机号
    let verificationCode = that.data.verificationCode;//验证码
    let newPassword = that.data.newPassword;//新密码
    let surePassword = that.data.surePassword;//确认密码

    if (surePassword == "" || newPassword == "") {
      wx.showToast({
        title: '密码不能为空',
        icon: 'none',
        duration: 1200
      })
    } else if (newPassword != surePassword) {
      wx.showToast({
        title: '两次密码输入不一致',
        icon: 'none',
        duration: 1200
      })
    } else {
      if (newPassword.length == 6) {
        let parameter = {
          code: verificationCode,
          mobile: inputValue,
          newPayPassword: newPassword,
          token: app.util.token
        }
        app.http.post_from('member/forgetPayPassword', parameter).then(res => {
          console.log(res)
          wx.showModal({
            title: '提示',
            content: res.data.res_info
          })
          if (res.data.res_code == 0) {
            that.setData({
              Box: true,
              forget: false
            })
          }
        }).catch(e => {
          console.log(e);
        })
      } else {
        wx.showToast({
          title: '请设置六位数密码',
          icon: 'none',
          duration: 1200
        })
      }
    }
  },

  binding(){//手机绑定
    this.setData({
      Box: false,
      binding: true,
      inputValue: '',//手机号
      newPassword: '',//新密码
      surePassword: '',//确认密码
      verificationCode: '',//验证码
      paymentPrimary: '',//原密码
      count: '获取验证码',
      countState: true
    })
  },
  bindingComplete(){//立即绑定按钮
    let that = this;
    let inputValue = that.data.inputValue;
    let verificationCode = that.data.verificationCode;

    let parameter = {
      code: verificationCode,
      mobile: inputValue,
      token: app.util.token,
      type: 5
    }
    app.http.post_from('member/checkCode', parameter).then(res => {
      console.log(res)
      wx.showToast({
        title: res.data.res_info,
        icon: 'success',
        duration: 1200
      })
      if (res.data.res_code == 0) {
        that.setData({
          Box: true,
          binding: false
        })
      }
    }).catch(e => {
      console.log(e);
    })
  }
  
})