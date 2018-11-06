// pages/integralWay/index.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    remark: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getDetail();
  },
  onShow() {
    console.log('bank', this.data.bank);
  },
  getDetail() {
    let url = '/member/redPointDrawInit'
    let params = {
      token: app.util.token,
    }
    app.http.post_from(url, params).then(o => {
      let detail = o.data.res_data
      detail.placeholder = '请输入提现金额，最小' + detail.sill + '积分起提'
      let remark = detail.remark.split('\r\n')
      this.setData({
        detail,
        remark,
      })
    }).catch(e => {
      console.log('e', e)
    })
  },
  changeValue(e){
    this.data[e.target.dataset.prop] = e.detail.value
  console.log(e)
  },
  submit() {
    if (!this.data.drawPoint) {
      let that = this;
      wx.showModal({
        title: '提示',
        content: that.data.detail.placeholder,
        showCancel: false,
      })
      return;
    }
    if (!this.data.bank) {
      let that = this;
      wx.showModal({
        title: '提示',
        content: '请选择银行卡',
        showCancel: false,
      })
      return;
    }
    let url = '/member/redPointDraw'
    let params = {
      accountName: this.data.bank.accountName,
      accountNo: this.data.bank.accountNo,
      branchName: this.data.bank.branchName,
      drawPoint: this.data.drawPoint,
      drawType: 2,
      openBank: this.data.bank.openBankCity,
      openBankCity: this.data.bank.openBankCity,
      token: app.util.token,
    }
    app.http.post_from(url,params).then(o=>{
      wx.showModal({
        title: '提示',
        content: o.data.res_info,
        showCancel:false,
      })
    })
  },
  selectBank() {
    let url = '/pages/bankCard/bankCard?isSelect=true'
    wx.navigateTo({
      url: url,
    })
  }

})