// pages/orderlist/index.js
var app = getApp()
const Toast = require('../../dist/toast/toast');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tab: {
      navList: [{
        title: '全部',
        id: 0
      }, {
        title: '待发货',
        id: 1
      }, {
        title: '已发货',
        id: 2
      }, {
        title: '完成',
        id: 3
      }],
      selectedId: 0, //默认选中的下标
    },
    loadDone: false, //标识，用于判断是不是全部加载完了
    selectedId: 0, //当前选中的下标，用于传参
    token: '',
    pageNo: 1,
    goldStatus: [
      "待支付",
      "待发货",
      "已发货",
      "完成",
    ],
    dataList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      token: app.util.token
    })
    this.getList();
    
  },
  orderDetail(e) {
    let orderId = e.currentTarget.dataset.orderid;
    let href = '../orderDetail/index?orderId=' + orderId + '&orderType=2&id=' + e.currentTarget.dataset.id
    wx.navigateTo({
      url: href
    })
  },
  getList() {
    let url = "/order/coinExchangeOrderList";
    let params = {
      token: this.data.token,
      orderType: this.data.selectedId,
      pageNo: this.data.pageNo,
      pageSize: 10,
    }
    app.http.post_from(url, params).then(o => {
      let datalist = []
      if (this.data.pageNo > 1) { //如果不是第一页
        datalist = this.data.dataList
        o.data.res_data.coinExchangeOrderList.rows.forEach(a => {
          a.statusText = this.formatStatus(a.orderStatus)
          datalist.push(a);
        })
      } else {
        datalist = o.data.res_data.coinExchangeOrderList.rows.map(a => {
          a.statusText = this.formatStatus(a.orderStatus)
          return a
        })
      }
      this.setData({
        dataList: datalist
      })
      if (o.data.res_data.coinExchangeOrderList.total <= this.data.dataList.length) { //如果全部加载完毕了
        this.data.loadDone = true;
      }
    })
  },
  handleTabChange(e) { //订单状态选中事件
    // console.log(e.detail)
    this.setData({
      selectedId: e.detail,
      pageNo: 1,
      loadDone: false,
    })
    this.getList();
  },
  formatStatus(status) {
    let text = "";
    text = this.data.goldStatus[status];
    return text;
  },
  applyfo(e) { //申请维权
    let item = e.currentTarget.dataset.item;
    let options = {
      itemsIds: item.itemId,
      goodsName: item.goodsName,
      productSpec: item.productSpec,
      price: item.price,
      orderType: 0, //普通商品，抢购商品是1
    }
    console.log(item)
    //因为Image里面有逗号，JSON解析会出错，所以单独传
    let href = '../supportRight/index?&item=' + JSON.stringify(options) + "&goodsImage=" + item.goodsImage
    wx.navigateTo({
      url: href
    })
  },
  logistics(e) { //查看物流
    console.log(e);
    let href = "/pages/logistics/logistics?type=6&orderId=" + e.currentTarget.dataset.item.orderId + "&face=" + e.currentTarget.dataset.item.squareImage
    wx.navigateTo({
      url: href,
    })
  },
  confirm(e) { //确认收货
    var that = this;
    wx.showModal({
      title: '提示',
      content: '是否确认收货',
      success(o) {
        if (o.confirm) {
          let orderId = e.target.dataset.item.orderId;
          let params = {
            orderId,
            token: app.util.token,
          }
          let url = "/order/coinExchangeOrderRog"
          app.http.post_from(url, params).then(o => {
            Toast({
              message: o.data.res_info,
              selector: '#zan-toast-test'
            });
            that.getList();
          })
        }
      }
    })

  },
  cancel(e) { //取消订单
    var that = this;
    wx.showModal({
      title: '提示',
      content: '是否确认取消订单',
      success(o) {
        if (o.confirm) {
          let url = '/flashsale/orderCancel'
          let params = {
            token: app.util.token,
            orderId: e.target.dataset.item.orderId
          }
          app.http.post_from(url, params).then(o => {
            wx.showModal({
              title: '提示',
              content: o.data.res_info,
              showCancel: false,
            })
            if (o.data.res_code == 0) {
              that.getList()
            }
          }).catch(e => {
            console.log(url, e)
          })
        }
      }
    })
  },
  pays(e) { //支付
    console.log(e.currentTarget.dataset.item)
    let orderType = e.currentTarget.dataset.item.orderType
    let goodsdata = e.currentTarget.dataset.item.goodsList.map(o => {
      let obj = {
        buyCount: o.buyCount,
        productId: o.productId,
        "cartId": ""
      }
      return obj;
    })
    let href = '../settlement/settlement?orderType=' + orderType + '&goodsData=' + JSON.stringify(goodsdata)
    wx.navigateTo({
      url: href
    })
  },
  apprise(e) { //评价

  },
  onReachBottom() { //页面到底部了触发加载更多
  console.log('fsdf')
    if (this.data.loadDone) {
      return;
    }
    this.data.pageNo++;
    this.getList()
  }
})