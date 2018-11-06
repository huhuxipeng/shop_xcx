// pages/orderDetail/index.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId: '1681',
    detail: {},
    status: '',
    statusText: '',
    times: '',
    autoCloseSeconds: 0,
    setInver: '',
    statusImg: '../../static/images/icon/orderState1.png',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options.orderId) {
      this.data.orderId = options.orderId
    }
    let params = {
      token: app.util.token,
      orderId: this.data.orderId
    }
    let url = '/spell/getOrderDetailByOrderId' //拼团订单
    app.http.post_from(url, params).then(o => {
      console.log(o);
      let data = o.data.res_data;
      data.image = app.util.formatImg(data.image, 2)
      let status = data.orderStatus; //订单状态
      this.formatStatus(status); //对状态进行处理，格式化出状态中文名，以及图标；
      if (data.createDate) {
        data.createDate = new Date(data.createDate).format('yyyy-MM-dd hh:mm:ss')
      }
      if (data.paymentDate) {
        data.paymentDate = new Date(data.paymentDate).format('yyyy-MM-dd hh:mm:ss')
      }
      this.setData({
        detail: data,
        status: status,
      });

    }).catch(e => {
      console.log(url, e)
    })
  },
  settime(t) {
    console.log(t);
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
    }
  },
  formatStatus(orderStatus) {
    let arr = ["success", "refund", "refunds", "paying", "sending", "sended", "closed"]
    switch (orderStatus) {
      case 0:
        this.data.orderClass = arr[0]
        this.setData({
          statusText: "待支付",
          statusImg: '../../static/images/icon/orderState2.png'
        })
        break;
      case 3:
        this.data.orderClass = arr[0]
        this.setData({
          statusText: "已完成",
          statusImg: '../../static/images/icon/orderState1.png'
        })
        break;
      case 2:
        this.data.orderClass = arr[5]
        this.setData({
          statusText: "已发货",
          statusImg: '../../static/images/icon/orderState5.png'
        })
        break;
      case 1:
        this.data.orderClass = arr[3]
        this.setData({
          statusText: "已支付",
          statusImg: '../../static/images/icon/orderState3.png'
        })
        break;
      case 4:
        this.data.orderClass = arr[0]
        this.setData({
          statusText: "待开奖",
          statusImg: '../../static/images/icon/orderState2.png'
        })
        break;
      case 5:
        this.data.orderClass = arr[0]
        if (this.data.detail.spellType) {
          this.setData({
            statusText: "中奖,待发货",
            statusImg: '../../static/images/icon/orderState4.png'
          })
        } else {
          this.setData({
            statusText: "待发货",
            statusImg: '../../static/images/icon/orderState3.png'
          })
        }
        break;
      case -9:
        this.data.orderClass = arr[1]
        this.setData({
          statusText: "已取消",
          statusImg: '../../static/images/icon/orderState7.png'
        })
        break;
      case -8:
        this.data.orderClass = arr[2]
        this.setData({
          statusText: "已退款",
          statusImg: '../../static/images/icon/orderState6.png'
        })
        break;
      case -7:
        this.data.orderClass = arr[6]
        this.setData({
          statusText: "待支付",
          statusImg: '../../static/images/icon/orderState2.png'
        })
        break;
      case -6:
        this.data.orderClass = arr[0]
        this.setData({
          statusText: "未中奖",
          statusImg: '../../static/images/icon/orderState6.png'
        })
        break;
    }
  },
  onUnload() {
    clearInterval(this.data.setInver);
  }
})