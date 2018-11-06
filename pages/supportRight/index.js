// pages/supportRight/index.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId: '3779',
    types: ["仅退款", "退货退款"],
    rightType: '请选择',
    reason: '请选择',
    money: 0,
    reasons: [
      "商家发货太慢",
      "商品描述不符合",
      "质量问题",
      "快递一直收不到",
      "无理由，不想买了",
      "其他"
    ],
    detail: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log('擦擦擦',options)
    let item = JSON.parse(options.item);
    item.goodsImage = options.goodsImage;
    this.setData({
      detail: item,
    })
  },
  showTypeSelect() {
    this.setData({
      rightTypeShow: !this.data.rightTypeShow,
    })
  },
  showReasonSelect() {
    this.setData({
      reasonShow: !this.data.reasonShow,
    })
  },
  rightTypeChange(e) {
    console.log(e)
    let name = e.target.dataset.name;
    this.setData({
      rightType: name,
      rightTypeShow: !this.data.rightTypeShow,
    })
  },
  reasonChange(e) {
    console.log(e)
    let name = e.target.dataset.name;
    this.setData({
      reason: name,
      reasonShow: !this.data.reasonShow,
    })
  },
  changeValue(e) {
    let options = {};
    if (e.detail.value>this.data.detail.price){
      options[e.target.dataset.prop] = this.data.detail.price
    }else{
      options[e.target.dataset.prop] = e.detail.value
    }
    this.setData(options);
  },
  subbmit() {
    let type = ""
    if (this.data.rightType == "仅退款") {
      type = 0;
    } else if (this.data.rightType == "退货退款") {
      type = 1;
    } else {
      wx.showModal({
        title: '提示',
        content: '请选择退货类型',
        showCancel: false,
      })
      return
    }
    if (this.data.reason == "请选择") {
      wx.showModal({
        title: '提示',
        content: '请选择退款原因',
        showCancel: false,
      })
      return
    }

    console.log(app.util)
    let params = {
      itemsIds: this.data.detail.itemsIds,
      reason: this.data.reason,
      type: type,
      token: app.util.token,
      itemsType: this.data.detail.orderType,
      price: this.data.money
    }
    let url = "order/right/submit"
    app.http.post_from(url, params).then(o => {
      wx.showModal({
        title: '提示',
        content: o.data.res_info,
        showCancel: false,
      })
      if (o.data.res_code == 0) {
        wx.navigateBack({})
      }
    }).catch(e => {
      console.log(url, e)
    })
  }
})