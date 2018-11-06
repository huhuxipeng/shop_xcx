var app = getApp()
Page({
  data: {
    step: 0,
    nameinput: '',
    cardinput: '',
    choicetype: '',
    choicephone: '',
    cardtype: '',
    checkCode: '',
    seconds: -1,
    decompose1: '',
    decompose2: '',
    result: '',
  },
  onShow() {
    this.getCardList();
    
  },
  selectThis(e){
    console.log(e)
    let item = e.currentTarget.dataset.item;
    let pages = getCurrentPages(); //页面数组
    let prevPage = pages[pages.length - 2]; //上一页面
    let accountNo = item.accountNo
    item.card1 = accountNo.substring(0, 4);
    item.card2 = accountNo.substr(accountNo.length - 4);
    prevPage.setData({ //直接给上移页面赋值
      bank: item,
    });
    wx.navigateBack();
  },
  onLoad(options){
    this.setData(options)
  },
  getCardList() { //获取绑定银行卡列表
    let that = this;
    let parameter = {
      token: app.util.token,
    };
    app.http.post_from('member/bankCardList', parameter).then(res => {
      let resultMap = res.data.res_data.resultMap;
      for (let i = 0; i < resultMap.length; i++) {
        let accountNo = resultMap[i].accountNo;
        let card1 = accountNo.substring(0, 4);
        let card2 = accountNo.substr(accountNo.length - 4);
        resultMap[i].card1 = card1;
        resultMap[i].card2 = card2;
        if (resultMap[i].isDefault == 1) {
          resultMap[i].default = true;
        } else {
          resultMap[i].default = false;
        }
      }
      that.setData({
        resultMap: resultMap
      })
    }).catch(e => {
      console.log(e);
    })
  },
  deleteFun(e) { //删除绑定银行卡
    let that = this;
    let idx = e.target.dataset.idx;
    let parameter = {
      cardNum: that.data.resultMap[idx].accountNo,
      token: app.util.token,
    };
    app.http.post_from('member/bankCardUnbind', parameter).then(res => {
      if (res.data.res_code == 0) {
        let resultMap = that.data.resultMap.splice(0, idx);
        that.setData({
          resultMap: resultMap
        })
        that.getCardList();
      }
    }).catch(e => {
      console.log(e);
    })
  },
  defaultFun(e) { //设置默认值
    let that = this;
    let idx = e.target.dataset.idx;
    let that_default = 'resultMap[' + idx + '].default';
    let parameter = {
      cardNum: that.data.resultMap[idx].accountNo,
      token: app.util.token,
    };
    if (that.data.resultMap[idx].default == false) {
      app.http.post_from('member/setDefaultBankCard', parameter).then(res => {
        let res_code = res.data.res_code;
        if (res_code == 0) { //请求成功
          that.setData({
            [that_default]: true
          })
        }
      }).catch(e => {
        console.log(e);
      })
    }
  },
  nameinput(e) { //请输入您的姓名
    let value = e.detail.value;
    this.setData({
      nameinput: value
    })
  },
  cardinput(e) { //请输入您的卡号
    let value = e.detail.value;
    this.setData({
      cardinput: value
    })
  },
  choicetype(e) { //请输入您的卡类型
    let value = e.detail.value;
    this.setData({
      choicetype: value
    })
  },
  choicephone(e) { //请输入您的手机号
    let value = e.detail.value;
    this.setData({
      choicephone: value
    })
  },
  checkCode(e) { //请输入校验码
    let value = e.detail.value;
    this.setData({
      checkCode: value
    })
  },
  plusFun(e) { //添加银行卡
    let that = this;
    let step = that.data.step;
    if (step == 0) {
      step++
      that.setData({
        step: step
      })
    } else if (step == 1) {
      let nameinput = that.data.nameinput;
      let cardinput = that.data.cardinput;
      console.log(nameinput)
      console.log(cardinput)
      if (nameinput == '' || cardinput == '') { //不能为空
        wx.showToast({
          title: '请完善信息',
          icon: 'none',
          duration: 1200
        })
        return false
      } else {
        let parameter = {
          cardNum: cardinput,
          cardholder: nameinput,
          token: app.util.token
        };
        app.http.post_from('member/bankCardCertificate', parameter).then(res => { //银行卡绑定
          if (res.data.res_code == 1) { //1为失败
            wx.showToast({
              title: res.data.res_data.reason,
              icon: 'none',
              duration: 1200
            })
            return false
          } else if (res.data.res_code == 2) { //2为未知错误
            wx.showToast({
              title: res.data.res_info,
              icon: 'none',
              duration: 1200
            })
            return false
          }
          let cardtype = res.data.res_data.result.information.cardtype;
          step++
          that.setData({
            step: step,
            cardtype: cardtype,
            result: res.data.res_data.result,
          })
        }).catch(e => {
          console.log(e);
        })
      }
    } else if (step == 2) {
      var phoneReg = /(^1[3|4|5|7|8]\d{9}$)|(^09\d{8}$)/;
      let choicephone = that.data.choicephone;
      if (choicephone == '' || !phoneReg.test(choicephone)) { //不能为空
        wx.showToast({
          title: '请完善信息',
          icon: 'none',
          duration: 1200
        })
        return false
      } else {
        that.countDown(1);
        let decompose1 = choicephone.substring(0, 3);
        let decompose2 = choicephone.substr(choicephone.length - 4);
        that.setData({
          decompose1: decompose1,
          decompose2: decompose2,
        })
      }
    }
  },
  countDown(idx) { //60秒倒计时
    let that = this;
    let index = idx;
    let n = 60;
    let choicephone = that.data.choicephone;
    let step = that.data.step;
    n--
    that.setData({
      seconds: n,
    })
    let t = setInterval(function() {
      n--
      that.setData({
        seconds: n
      })
      if (n < 0) {
        clearInterval(t)
      }
    }, 1000)
    let parameter = {
      mobile: choicephone,
      token: app.util.token,
      type: 6
    };
    app.http.post_from('member/mobileCheck', parameter).then(res => { //发送手机验证码
      if (res.data.res_code == 0) {
        if (index == 1) {
          step++
          that.setData({
            step: step
          })
        }
      } else {
        wx.showToast({
          title: '接收失败',
          icon: 'none',
          duration: 1200
        })
        return false
      }
    }).catch(e => {
      console.log(e);
    })
  },
  secondFun() { //发送校验码
    this.countDown(2);
  },
  subFun() { //银行卡手机验证
    let that = this;
    if (that.data.checkCode == '') {
      wx.showToast({
        title: '校验码不能为空',
        icon: 'none',
        duration: 1200
      })
      return false
    } else {
      let result = JSON.stringify(that.data.result);
      let parameter = {
        json: result, //银行卡信息
        code: that.data.checkCode, //验证码
        mobile: that.data.choicephone, //手机号
        token: app.util.token,
        type: 6
      };
      app.http.post_from('member/checkCodeBankCard', parameter).then(res => { //提交验证码
        if (res.data.res_code == 1) {
          wx.showToast({
            title: '验证失败',
            icon: 'none',
            duration: 1200
          })
          return false
        } else if (res.data.res_code == 0) {
          that.setData({
            step: 0
          })
          that.getCardList();
        }
      }).catch(e => {
        console.log(e);
      })
    }
  }
})