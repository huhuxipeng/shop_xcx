// pages/orderlist/index.js
var app = getApp()
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
        title: '待付款',
        id: 1
      }, {
        title: '待分享',
        id: 2
      }, {
        title: '待发货',
        id: 3
      }, {
        title: '待收货',
        id: 4
      }],
      selectedId: 0, //默认选中的下标
    },
    selectedId: 0, //当前选中的下标，用于传参
    token: '',
    pageNo: 1,
    showPayAction: false,
    stores: ["待付款", "待分享", "拼团成功", "拼团失败", "取消拼团"],
    goldStatus: [
      "待支付",
      "待发货",
      "已发货",
      "完成",
    ],
    dataList: [],
    times: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow() {
    if (this.data.onShows) {
      this.setData({
        token: app.util.token
      })
      this.getList()
      return
    }
    this.setData({
      onShows : true
    })
  },
  onLoad: function(options) {
    this.setData({
      token: app.util.token
    })
    this.getList();
  },
  zjxqFun(e){
    let activityId = e.currentTarget.dataset.item.activityId;
    let orderId = e.currentTarget.dataset.item.orderId;
    wx.navigateTo({
      url: '/pages/prize/prize?activityId=' + activityId+'&orderId='+orderId
    })
  },
  orderDetail(e) { //查看订单详情
    let orderId = e.currentTarget.dataset.orderid;
    let href = '../groupOrderDetail/index?orderId=' + orderId
    wx.navigateTo({
      url: href
    })
  },
  formatStatus(o) {
    //格式化状态
    let status = o.status;
    let orderStatus = o.orderStatus;
    let spellType = o.spellType;
    //未付款
    if (orderStatus == 0) {
      return "待付款";
    } else if (orderStatus == 1) {
      //已付款
      return "待分享";
    } else if (orderStatus == 2) {
      if (spellType) {
        return "恭喜中奖，已发货";
      }
      return "拼团成功，已发货";
    } else if (orderStatus == 3) {
      return "已完成";
    } else if (orderStatus == 4) {
      return "待开奖";
    } else if (orderStatus == 5) {
      if (spellType) {
        return "恭喜中奖，待发货";
      }
      return "拼团成功，待发货";
    } else if (orderStatus == -6) {
      if (spellType) {
        if (status == 3) {
          return "拼团失败，退款中"
        }
        return "未中奖，退款中";
      }
      return "退款中";
    } else if (orderStatus == -7) {
      return "已作废";
    } else if (orderStatus == -8) {
      if (spellType) {
        if (status == 3) {
          return "拼团失败，已退款"
        }
        return "未中奖，已退款";
      }
      return "已退款";
    } else if (orderStatus == -9) {
      return "已取消";
    }
  },
  settime(timestamp, index) {
    let nowTime = new Date();
    let endTime = new Date(timestamp);
    let t = endTime.getTime() - nowTime.getTime();
    if (t > 0) {
      let day = Math.floor(t / 86400000);
      let hour = Math.floor(t / 3600000);
      let min = Math.floor((t / 60000) % 60);
      let sec = Math.floor((t / 1000) % 60);
      hour = hour < 10 ? "0" + hour : hour;
      min = min < 10 ? "0" + min : min;
      sec = sec < 10 ? "0" + sec : sec;
      let format = "";
      if (day > 0) {
        format = `${hour}:${min}:${sec}`;
      }
      if (day <= 0 && hour > 0) {
        format = `${hour}:${min}:${sec}`;
      }
      if (day <= 0 && hour <= 0) {
        format = `${"00"}:${min}:${sec}`;
      }
      return format;
    } else {
      this.clearInter(index)
    }
  },
  getList() {
    this.clearInter();
    let url = "/spell/getSpellOrderList";
    let params = {
      token: this.data.token,
      status: this.data.selectedId,
      pageNo: this.data.pageNo,
      pageSize: 10,
    }
    app.http.post_from(url, params).then(o => {
      let datalist = o.data.res_data.spellList.map((a, index) => {
        a.shareImage = app.util.formatImg(a.shareImage, 3)
        a.endTime = this.settime(a.endDate, index)
        a.statusText = this.formatStatus(a);
        var that = this;
        if (a.status == 1) {
          this.data.times.push(
            setInterval(o => {
              let b = 'dataList[' + index + '].endTime'
              that.setData({
                [b]: that.settime(a.endDate, index)
              })
            }, 1000)
          );
        }
        return a
      })
      this.setData({
        dataList: datalist
      })
    })
  },
  clearInter(index) {
    if (index || index == 0) {
      this.data.times.forEach((o, i) => {
        if (index == i) {
          clearInterval(o);

        }
      });
    } else {
      this.data.times.forEach((o) => {
        clearInterval(o);
        this.data.times = [];
      });
    }

  },
  handleTabChange(e) { //订单状态选中事件
    this.clearInter();

    this.setData({
      selectedId: e.detail
    })
    this.getList();
  },
  prizeDetail(e) { //中奖详情

  },
  deleteOrder(e) {
    let that = this;
    wx.showModal({
      title: '提示',
      content: '是否确认删除订单',
      success(o) {
        if (o.confirm) {
          let item = e.currentTarget.dataset.item
          let params = {
            token: app.util.token,
            spellId: item.spellId
          };
          let url = "/spell/doDeleteSpellOrder";
          app.http.post_from(url, params).then(o => {
            wx.showModal({
              title: '提示',
              content: o.data.res_info,
              showCancel:false,
              success() {
                that.onShow();
              }
            })
          }).catch(e => {
            console.log(e)
          })
        }
      }
    })
  },
  logistics(e) { //查看物流
    let href = "/pages/logistics/logistics?type=5&face=" + e.currentTarget.dataset.item.image + '&orderId=' + e.currentTarget.dataset.item.orderId
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
          let item = e.currentTarget.dataset.item
          let orderId = item.orderId;
          let url = '/spell/spellOrderRog';
          let params = {
            orderId,
            token: app.util.token,
          }
          app.http.post_from(url, params).then(o => {
            wx.showModal({
              title: '提示',
              content: o.data.res_info,
              showCancel: false,
            })
            that.getList()
          }).catch(e => {
            console.log(e)
          })
        }
      }
    })

  },
  cancel(e) { //取消订单
    var that = this;
    wx.showModal({
      title: '提示',
      content: '是否取消订单',
      success(o) {
        if (o.confirm) {
          let item = e.currentTarget.dataset.item
          let spellId = item.spellId;
          let url = '/spell/spellCancel';
          let params = {
            spellId,
            token: app.util.token,
          }
          app.http.post_from(url, params).then(o => {
            wx.showModal({
              title: '提示',
              content: o.data.res_info,
              showCancel: false,
            })
            that.getList()
          }).catch(e => {
            console.log(e)
          })
        }
      }
    })

  },
  invinte(e) { //邀请好友
    let item = e.currentTarget.dataset.item
    let spellId = item.spellId;
    let orderId = item.orderId;
    let url = '/pages/groupTime/index?spellId=' + spellId + '&orderId=' + orderId
    wx.navigateTo({
      url,
    })
  },
  pays(e) { //支付
    let orderId = e.currentTarget.dataset.item.orderId;
    let spellId = e.currentTarget.dataset.item.spellId;
    this.setData({
      orderId,
      spellId,
      showPayAction: true,
    })
  },
  apprise(e) { //评价
    let orderSn = e.currentTarget.dataset.item.orderSn;
    let orderType = e.currentTarget.dataset.item.orderType;
    let href = '../appraise/index?orderSn=' + orderSn + '&orderType=' + orderType
    wx.navigateTo({
      url: href
    })
  },

})