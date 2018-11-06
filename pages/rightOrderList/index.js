// pages/orderlist/index.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectedId:0,//当前选中的下标，用于传参
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
    dataList:[],
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
  onShow(){
    if(this.data.noFirst){
      this.getList();
    }else{
      this.data.noFirst = true;
    }
  },
  orderDetail(e){
    let id = e.currentTarget.dataset.id;
    let href = '../rightDetail/index?id=' + id
    wx.navigateTo({
      url: href
    })
  },
  getList() {
    let url = "/order/right/page";
    let params = {
      token: this.data.token,
      pageNo: this.data.pageNo,
      pageSize: 10,
    }
    app.http.post_from(url,params).then(o=>{
      
      let datalist = o.data.res_data.dataList.dataList.map(a => {
        
        a.items.forEach(b=>{
          b.goodsImage = app.util.formatImg(b.goodsImage,3)
        })
        if (a.order.comName==null){
          a.order.comName=''
        }
       a.statusText = this.formatStatus(a.orderStatus)
        return a
      })
      this.setData({
        dataList: datalist
      })
      if (o.data.res_data.dataList.total <= this.data.dataList.length) { //如果全部加载完毕了
        this.data.loadDone = true;
      }
    })
  },
  handleTabChange(e){//订单状态选中事件
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
    // console.log(text);
    return text;
  },
  onReachBottom() { //页面到底部了触发加载更多
    if (this.data.loadDone) {
      return;
    }
    this.data.pageNo++;
    this.getList()
  },
  applyfo(e){//申请维权

  },
  logistics(e) {//查看物流
  
  },
  confirm(e) {//确认收货

  },
  cancel(e) {//取消订单
    // console.log(e.target.dataset.item)
  },
  pays(e) {//支付

  },
  apprise(e) {//评价

  },

})