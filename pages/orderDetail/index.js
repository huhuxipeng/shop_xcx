// pages/orderDetail/index.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId: '3779',
    detail: {},
    status: '',
    statusText: '',
    times: '',
    autoCloseSeconds:0,
    setInver: '',
    orderType:0,
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
    let url = '/order/orderDetails'//普通订单
    this.setData({
      orderType: options.orderType
    })
    if(options.orderType==1){//抢购订单
      url = 'flashsale/orderDetails'
    }
    if (options.orderType == 2) {//金币兑换订单
      url = '/order/coinExchangeOrderDetails'
      params.id = options.id
    }
    app.http.post_from(url, params).then(o => {
      // console.log(o);

      let data = o.data.res_data;
      if (options.orderType == 2) {
        data.order = data.coinExchangeOrder
      }
      data.orderItemsList.forEach(a => {
        a.goodsImage = app.util.formatImg(a.goodsImage, 2)
      })
      let status = data.order.orderStatus; //订单状态
      this.formatStatus(status); //对状态进行处理，格式化出状态中文名，以及图标；
      if (data.order.createTime) {
        data.order.createTime = new Date(data.order.createTime).format('yyyy-MM-dd hh:mm:ss')
      }
      if (data.order.paymentTime) {
        data.order.paymentTime = new Date(data.order.paymentTime).format('yyyy-MM-dd hh:mm:ss')
      }
      if (data.order.createDate) {
        data.order.createDate = new Date(data.order.createDate).format('yyyy-MM-dd hh:mm:ss')
      }
      if (data.order.paymentDate) {
        data.order.paymentDate = new Date(data.order.paymentDate).format('yyyy-MM-dd hh:mm:ss')
      }
      this.setData({
        detail: data,
        status: status,
      });
      if(status==5||status==0){
        if(status==0){
          this.data.closeSeconds = o.data.res_data.autoCloseSeconds * 1000;
        }else{
          this.data.closeSeconds = o.data.res_data.autoConfirmSeconds * 1000;
        }
        this.data.setInver = setInterval(o => {
          this.data.closeSeconds -= 1000;
          if (this.data.closeSeconds <= 0) {
            clearInterval(this.data.setInver);
          } else {
            this.setData({
              times: this.settime(this.data.closeSeconds)
            })
          }
        }, 1000)
      }
     
    }).catch(e => {
      console.log(url, e)
    })
  },
  settime(t) {
    console.log(t);
    if (t > 0) {
      let day = Math.floor(t / 86400000);
      let hour = Math.floor(t / 3600000%24);
      let min = Math.floor((t / 60000) % 60);
      let sec = Math.floor((t / 1000) % 60);
      hour = hour < 10 ? "0" + hour : hour;
      min = min < 10 ? "0" + min : min;
      sec = sec < 10 ? "0" + sec : sec;

      let format = "";
      if (day > 0) {
        format = `${day}天${hour}小时${min}分${sec}秒`;
      }
      if (day <= 0 && hour > 0) {
        format = `${hour}小时${min}分${sec}秒`;
      }
      if (day <= 0 && hour <= 0) {
        format = `${min}分${sec}秒`;
      }
      return format;




      // let day = Math.floor(t / 86400000);
      // let hour = Math.floor(t / 3600000);
      // let min = Math.floor((t / 60000) % 60);
      // let sec = Math.floor((t / 1000) % 60);
      // hour = hour < 10 ? "0" + hour : hour;
      // min = min < 10 ? "0" + min : min;
      // sec = sec < 10 ? "0" + sec : sec;
      // let format = "";
      // if (day > 0) {
      //   format = `${hour}:${min}:${sec}`;
      // }
      // if (day <= 0 && hour > 0) {
      //   format = `${hour}:${min}:${sec}`;
      // }
      // if (day <= 0 && hour <= 0) {
      //   format = `${"00"}:${min}:${sec}`;
      // }
      // return format;
    }
  },
  formatStatus(status) {
    console.log('this.data.orderType', this.data.orderType)
    console.log('status', status)
    if (this.data.orderType == 2){//如果是金币兑换订单
      switch (status) {
        case -1:
          this.setData({
            statusText: "已取消",
            statusImg: '../../static/images/icon/orderState2.png'
          })
          break;
        case 1:
          this.setData({
            statusText: "待发货",
            statusImg: '../../static/images/icon/orderState3.png'
          })
          break;
        case 2:
          this.setData({
            statusText: "已发货",
            statusImg: '../../static/images/icon/orderState5.png'
          })
          break;
        case 3:
          this.setData({
            statusText: "已完成",
            statusImg: '../../static/images/icon/orderState1.png'
          })
          break;
          }
          return
    }
    switch (status) {
      case 0:
        this.setData({
          statusText: "待付款",
          statusImg: '../../static/images/icon/orderState2.png'
        })
        break;
      case 1:
        this.setData({
          statusText: "待发货",
          statusImg: '../../static/images/icon/orderState3.png'
        })
        break;
      case 2:
        this.setData({
          statusText: "待发货",
          statusImg: '../../static/images/icon/orderState3.png'
        })
        break;
      case 3:
        this.setData({
          statusText: "待发货",
          statusImg: '../../static/images/icon/orderState3.png'
        })
        break;
      case 5:
        this.setData({
          statusText: "已发货",
          statusImg: '../../static/images/icon/orderState5.png'
        })
        break;
      case 6:
        this.setData({
          statusText: "交易完成",
          statusImg: '../../static/images/icon/orderState1.png'
        })
        break;
      case 7:
        this.setData({
          statusText: "交易完成",
          statusImg: '../../static/images/icon/orderState1.png'
        })
        break;
      case -3:
        this.setData({
          statusText: "维权中",
          statusImg: '../../static/images/icon/orderState6.png'
        })
        break;
      case -2:
        this.setData({
          statusText: "维权中",
          statusImg: '../../static/images/icon/orderState6.png'
        })
        break;
      case -8:
        this.setData({
          statusText: "维权成功",
          statusImg: '../../static/images/icon/orderState8.png'
        })
        break;
    }
  },
  onUnload(){
    clearInterval(this.data.setInver);
  },
  onHide(){
    clearInterval(this.data.setInver);
  }
})