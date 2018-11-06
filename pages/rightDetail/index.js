// pages/rightDetail/index.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '434',
    detail: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    if (options.id) {
      this.data.id = options.id;
    }
    this.getDetail();
  },
  getDetail() {
    let params = {
      id: this.data.id,
      token: app.util.token,
    }
    let url = "order/right/detail"
    app.http.post_from(url, params).then(o => {
      let data = o.data.res_data;
      data.items.forEach(a => {
        a.goodsImage = app.util.formatImg(a.goodsImage);
      })
      data.right.processList.forEach(a => {
        a.createTime = new Date(a.createTime).format('yyyy-MM-dd hh:mm:ss')
      })
      this.setData({
        detail: data,
      })
    }).catch(e => {
      console.log(url, e)
    })
  },
  cancel() { //取消维权
    let that = this;
    wx.showModal({
      title: '提示',
      content: '是否取消维权',
      success() {
        let url = "order/right/cancel"
        let params = {
          id: that.data.id,
          token: app.util.token,
        }
        app.http.post_from(url, params).then(o => {
          if (o.data.res_code == 0) {
            wx.showModal({
              title: '提示',
              content: o.data.res_info,
              showCancel: false,
              success() {
                wx.navigateBack({})
              }
            })

          }
        }).catch(e => {
          console.log(url, e)
        })
      }
    })

  },
  write() { //填写物流信息
    wx.navigateTo({
      url: '/pages/writeLogistics/index?id=' + this.data.id,
    })
  },
  logi() { //退货物流
    let typeId = 0; //普通订单；
    if (this.data.detail.order.orderType == 1) { //
      typeId = 7;
    }
    let href = "/pages/logistics/logistics?rightOrderId=" + this.data.detail.right.id + "&face=" + this.data.detail.items[0].goodsImage
    wx.navigateTo({
      url: href,
    })
  },
  again() { //重新维权
    console.log(this.data.detail);
    let item = e.currentTarget.dataset.item;
    console.log(e.currentTarget.dataset)
    let options = {
      itemsIds: this.data.detail.items[0].itemId,
      goodsName: this.data.detail.items[0].goodsName,
      productSpec: this.data.detail.items[0].productSpec,
      price: this.data.detail.items[0].price,
      orderType: this.data.detail.order.ordertype, //0普通商品，抢购商品是1
    }
    console.log(item)
    //因为Image里面有逗号，JSON解析会出错，所以单独传
    let href = '../supportRight/index?&item=' + JSON.stringify(options) + "&goodsImage=" + this.data.detail.items[0].goodsImage
    wx.navigateTo({
      url: href
    })
  }
})