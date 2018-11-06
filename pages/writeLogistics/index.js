// pages/writeLogistics/index.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show:false,
    logiList:[],
    logiName:'选择物流信息'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData(options);
    this.getDelivery();
  },  
  submit(){
    let url = '/order/right/submitDelivery';
    let params = {
      logiId: this.data.logiId,
      logiNo: this.data.logiNo,
      rightOrderId: this.data.id,
      token:app.util.token,
    }
    app.http.post_from(url,params).then(o=>{
      if(o.data.res_code==0){
        let pages = getCurrentPages(); //页面数组
        let prevPage = pages[pages.length - 2]; //上一页面
        prevPage.getDetail();//物流详情重新获取数据
        wx.navigateBack({
        })
      }
    })
  },
  changeValue(e) {
    let options = {};
    this.data[e.target.dataset.prop] = e.detail.value
  },
  showPopup(){
    this.setData({
      show:true
    })
  },
  select_this(e){
    let logiId = e.detail.value;
    this.data.logiList.forEach(o=>{
      if (o.logiId == logiId){
        this.setData({
          logiId: logiId,
          logiName: o.logiName,
          show:false,
        })
      }
    })
    console.log(e)
  },
  getDelivery(){//获取物流公司
    let url = '/order/right/inputDelivery'
    let params = {
      rightOrderId:this.data.id,
      token:app.util.token
    }
    app.http.post_from(url,params).then(o=>{
      if(o.data.res_code!=0){
        wx.showModal({
          title: '提示',
          content: o.data.res_info,
          showCancel:false,
        })
        return;
      }
      this.setData({
        logiList: o.data.res_data.logiList
      })
    })
  },
})