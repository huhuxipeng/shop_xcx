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
        title: '全部订单',
        id: 0
      }, {
        title: '待付款',
        id: 1
      }, {
        title: '已付款',
        id: 2
      }, {
        title: '待收货',
        id: 3
      }, {
        title: '待评价',
        id: 4
      }, {
        title: '店长礼包',
        id: 5
      }],
      selectedId: 0, //默认选中的下标
    },
    loadDone: false, //标识，用于判断是不是全部加载完了
    selectedId: 0, //当前选中的下标，用于传参
    showPayAction: false,
    token: '',
    pageNo: 1,
    stores: [
      "待支付",
      "待发货",
      "待发货",
      "待发货",
      "",
      "待收货",
      "待评价",
      "已评价",
      "维权中"
    ],
    goldStatus: [
      "待支付",
      "待发货",
      "已发货",
      "完成",
    ],
    dataList: [],
    firstOpen: true,
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
  onShow() {
    if (this.data.firstOpen) { //如果是第一次打开会触发onload，所以不需要执行getList
      this.data.firstOpen = false;
    } else {
      this.getList()
    }
  },
  orderDetail(e) {
    let orderId = e.currentTarget.dataset.orderid;
    let orderType = e.currentTarget.dataset.ordertype
    let href = '../orderDetail/index?orderId=' + orderId + '&orderType=' + orderType
    wx.navigateTo({
      url: href
    })
  },
  getList() {
    let url = "order/pageOrder";
    if (this.data.selectedId == 5) { //如果是店长礼包
      url = "/order/pageGiftOrder"
    }
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
        o.data.res_data.dataList.forEach(a => {
          a.goodsList.forEach(b => {
            b.goodsImage = app.util.formatImg(b.goodsImage, 3)
          })
          a.statusText = this.formatStatus(a.orderStatus)
          datalist.push(a);
        })
      } else {
        datalist = o.data.res_data.dataList.map(a => {
          a.goodsList.forEach(b => {
            b.goodsImage = app.util.formatImg(b.goodsImage, 3)
          })
          a.statusText = this.formatStatus(a.orderStatus)
          return a
        })
      }
      this.setData({
        dataList: datalist
      })

      if (o.data.res_data.total <= this.data.dataList.length) { //如果全部加载完毕了
        this.data.loadDone = true;
      }
    })
  },
  handleTabChange(e) { //订单状态选中事件
    this.setData({
      selectedId: e.detail,
      pageNo: 1,
      loadDone: false,
    })
    this.getList();
  },
  formatStatus(status) {
    let text = "";
    if (this.data.isGoldChanger) {
      text = this.data.goldStatus[status == (-2 || -1 || -3) ? 8 : status];
    } else {
      text = this.data.stores[status == (-2 || -1 || -3) ? 8 : status];
    }

    if (status == -8) {
      text = "退款成功"
    }
    if (status == -10) {
      text = "退货退款成功"
    }
    return text;
  },
  applyfo(e) { //申请维权
    let idx = e.currentTarget.dataset.idx;
    let orderAmount = this.data.dataList[idx].orderAmount;
    let item = e.currentTarget.dataset.item;
    let options = {
      itemsIds: item.itemId,
      goodsName: item.goodsName,
      productSpec: item.productSpec,
      price: orderAmount,
      orderType: e.currentTarget.dataset.ordertype, //0普通商品，抢购商品是1
    }
    //因为Image里面有逗号，JSON解析会出错，所以单独传
    let href = '../supportRight/index?&item=' + JSON.stringify(options) + "&goodsImage=" + item.goodsImage
    wx.navigateTo({
      url: href
    })
  },
  logistics(e) { //查看物流
    let typeId = 0;//普通订单；
    if (e.currentTarget.dataset.item.orderType==1){//
      typeId = 7;
    }
    let href = "/pages/logistics/logistics?type="+typeId+"&orderId=" + e.currentTarget.dataset.item.orderId +"&face=" + e.currentTarget.dataset.item.goodsList[0].goodsImage
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
          let url = "/order/orderRog"
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
    let url;
    if (e.currentTarget.dataset.item.orderType == 0) { //普通订单
      url = '/order/orderCancel'
    } else { //抢购订单
      url = '/flashsale/orderCancel'
    }
    wx.showModal({
      title: '提示',
      content: '是否确认取消订单',
      success(o) {
        if (o.confirm) {
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
    if (orderType == 1) { //限时抢购订单
      this.setData({
        orderId: e.currentTarget.dataset.item.orderId,
        flashsaleId: true,
        showPayAction: true,
      })
    } else {
      this.setData({
        orderId: e.currentTarget.dataset.item.orderId,
        showPayAction: true,
      })
    }
  },
  apprise(e) { //评价
    let orderSn = e.target.dataset.item.orderSn;
    let orderType = e.target.dataset.item.orderType;
    let href = '../appraise/index?orderSn=' + orderSn + '&orderType=' + orderType
    wx.navigateTo({
      url: href
    })
  },
  onReachBottom() { //页面到底部了触发加载更多
    if (this.data.loadDone) {
      return;
    }
    this.data.pageNo++;
    this.getList()
  }
})