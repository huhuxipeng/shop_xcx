// components/couponDetail/index.js
var app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    value:{
      type:Boolean,
      value:false,
      observer(o){
        this.setData({
          show:o,
           detail: this.data.couponList[this.data.index]
        })
      }
    },
    index:{
      type:Number,
      value:0,
    },
    couponList:{
      type: Array,
      value: [],
      observer(o) {
        console.log('couponList',o)
      }
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    show:false,
    detail:{},
  },

  /**
   * 组件的方法列表
   */
  methods: {
    lastOne(){
      if (this.data.index>0){//第一个的前一个，跳到最后一个
        this.data.index = this.data.index-1
      }else{
        this.data.index = this.data.couponList.length-1;
      }
      this.setData({
        detail: this.data.couponList[this.data.index]
      })
    },
    nextOne(){
      if (this.data.index == this.data.couponList.length-1 ) {//最后一个，那就跳到第一个
        this.data.index = 0
      } else {
        this.data.index = this.data.index + 1;
      }
      this.setData({
        detail: this.data.couponList[this.data.index]
      })
    },
    takeCoupon() { //领取优惠券
      let cpnId = this.data.detail.cpnId;
      let url = 'coupon/memberGetCoupon'
      let params = {
        cpnId: cpnId,
        token: app.util.token,
      }
      app.http.post_from(url, params).then(o => {
        if (o.data.res_code == 0) {
          // let pages = getCurrentPages(); //页面数组
          // let prevPage = pages[pages.length - 1]; //父页面
          // prevPage.getCouponList()//刷新优惠券，先不刷吧
          this.closeCouponDetail();
        }
        wx.showModal({
          title: '提示',
          content: o.data.res_info,
          showCancel:false,
        })
      })
    },
    closeCouponDetail(){
      let pages = getCurrentPages(); //页面数组
      let prevPage = pages[pages.length - 1]; //父页面
      prevPage.setData({
        showCouponDetail: false
      })
    },
  }
})
