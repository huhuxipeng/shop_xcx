var app;
Page({
  data: {
    tab: {
      navList: [],
      selectedId: 1,
    },
    pageFloorList: [],
    inputValue: '',
    focus: true,
    showCouponDetail:false,
    moudelLength: 7,
    pickCouponList: [],
    couponList: [],
    couponPopup: false,
  },
  onShareAppMessage: function (e) { //数据分享
    let o_coupon = this.data.pickCouponList[0]
    let path = '/pages/collarVoucher/collarVoucher?cpnId=' + o_coupon.cpnId + '&o_coupon_cpnId=' + o_coupon.cpnId + '&mold=0'
    return {
      title: o_coupon.shareTitle,
      desc: o_coupon.shareRemark,
      path: path,
      imageUrl: o_coupon.shareImg,
      success: (res) => {
        console.log("转发成功", res);
      },
      fail: (res) => {
        console.log("转发失败", res);
      }
    }
  },
  getCouponList() {
    let url = '/coupon/memberCouponList'
    let params = {
      isUse: 0, //未使用
      pageNo: 1,
      pageSize: 3,
      token: app.util.token,
    }
    app.http.post_from(url, params).then(o => {
      console.log(o);
      let couponList = o.data.res_data.dataList;
      couponList.forEach(o=>{
        o.typeName = app.util.formatCpnType(o.cpnType);
        console.log(o.typeName)
        o.useEndTime = new Date(o.useEndTime).format('yyyy-MM-dd hh:mm:ss');
      })
      if (couponList.length){
        this.setData({
          couponList: couponList,
          couponPopup: true,
        })
      }
    }).catch(e => {
      console.log(url, e)
    })
  },
  closeCouponPopup(){
    this.setData({
      couponPopup:false
    })
  },
  showRelDetail(e){
    let obj = {
      relType: e.currentTarget.dataset.item.relType1,
      relId: e.currentTarget.dataset.item.relId
    }
    app.util.showRelDetail(obj)
  },
  toUse(){
    let href = '/pages/myCoupon/myCoupon'
    wx.navigateTo({
      url: href,
    })
  },
  toSearch() {
    wx.navigateTo({
      url: '/pages/search/search',
    })
  },
  searchChange(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },
  onReachBottom: function() {
    let length = this.data.moudelLength + 7
    this.setData({
      moudelLength: length
    });
    // console.log(this.data.moudelLength)
  },
  searchDone(e) {
    // console.log('search', this.data.inputValue)
  },
  onShow(){
    // wx.clearStorage('userInfo')
  },
  onLoad: function() {
    this.formatTab();
    console.log(app.util.token);
    if (app.util.token) {
      if (wx.getStorageSync('today') == new Date().format('dd')) {//如果今天已经弹出过弹出了，就不用再弹了
        return;
      } else {
        wx.setStorageSync('today', new Date().format('dd'))
        this.getCouponList();//获取优惠券列表
      }
    }
  },
  handleTabChange(o) { //商品分类选择事件
    // console.log('分类选择Id', o);
    let selectedId = o.detail;
    this.getMoudelList(selectedId);
  },
  getMoudelList(selectedId) { //获取自定义模板
    let params = {
      pageId: selectedId
    }
    app.http.post_from('/basics/anon/getPageDataByPageId', params).then(res => { //获取商品分类列表
      let pageFloorList = res.data.res_data.pageFloorList.map(o => {
        o.pageFloorModuleList.forEach(element => {
          if (o.modelId == 1002) {
            element.pic = app.util.formatImg(element.pic) //一屏幕大小的图片
          } else {
            element.pic = app.util.formatImg(element.pic, 2) //小于半屏的图片
          }
        });
        let wh = o.modelWidth / o.modelHight;
        if (o.modelId == 1001) {
          o.height = 750 / wh + 5 + 'rpx';
        } else {
          o.height = 750 / wh + 'rpx';
        }
        return o;
      })
      this.setData({
        pageFloorList: pageFloorList
      })
    }).catch(e => {
      console.log(e);
    })
  },
  formatTab() { //格式化商品分类栏
    app = getApp()
    let params = {
      upGradeNo: app.http.upGradeNo
    }
    app.http.post_from('/basics/anon/getHomepageNavList', params).then(res => { //获取商品分类列表
      // console.log(res);
      let tab = {};
      let navList = res.data.res_data.navList.map((element, index) => {
        element.title = element.navName;
        element.id = element.pageId;
        if (index == 0) {
          tab.selectedId = element.pageId;
          this.getMoudelList(element.pageId);
        }
        return element;
      });
      tab.navList = navList
      this.setData({
        tab: tab,
      })
      // console.log('tab', this.data.tab)
    }).catch(e => {
      console.log(e);
    })
  },
  onShow: function() {

  },
})