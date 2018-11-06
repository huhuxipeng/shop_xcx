var app = getApp()
Page({
  data: {
    tabIndex: 0,
    tabs: true
  },
  onShow(){
    if(this.data.one){
      this.not(0)
      return
    }
    this.setData({
      one: true
    })

    let parame = {
      token: app.util.token
    }
    app.http.post_from('coupon/memberCouponCount', parame).then(res => {
      console.log('数据',res)
      this.setData({
        useData: res.data.res_data
      })
    })
  },
  onLoad() {
    this.not(0);
  },
  not(Use){
    let parameter = {
      isUse: Use,
      pageNo: 0,
      pageSize: 0,
      token: app.util.token
    }
    app.http.post_from('coupon/memberCouponList', parameter).then(res => {
      let dataList = res.data.res_data.dataList.map(o => {
        o.useBeginTime = new Date(o.useBeginTime).format("yyyy.MM.dd");
        o.useEndTime = new Date(o.useEndTime).format("yyyy.MM.dd");
        o.relType = o.relType1;
        switch (o.cpnType) {
          case 0:
            o.voucherImg_boxClass = "voucherImg_box2";
            o.couponClass = "coupon2";
            o.useClass = 'useClass0';
            o.cpnTypes = "分类券";
            break;
          case 1:
            o.voucherImg_boxClass = "voucherImg_box3";
            o.couponClass = "coupon3";
            o.useClass = 'useClass1';
            o.cpnTypes = "商品券";
            break;
          case 2:
            o.voucherImg_boxClass = "voucherImg_box0";
            o.couponClass = "coupon0";
            o.useClass = 'useClass2';
            o.cpnTypes = "店铺券";
            break;
          case 3:
            o.voucherImg_boxClass = "voucherImg_box1";
            o.couponClass = "coupon1";
            o.useClass = 'useClass3';
            o.cpnTypes = "通用券";
            break;
        }
        return o;
      })
      this.setData({
        dataList: dataList
      })
      this.setData({
        tabs: false
      })
    })
  },
  tabFun(e) {
    this.setData({
      tabs: false
    })
    let idx = e.currentTarget.dataset.idx;
    this.setData({
      tabIndex: idx
    })
    this.not(idx)
  },
  immediate(e) { //立即使用
    let idx = e.currentTarget.dataset.idx;
    app.util.showRelDetail(this.data.dataList[idx]);
  },
  mybindingFun() {
    wx.navigateTo({
      url: '/pages/mybinding/mybinding'
    })
  },
  mydetailsFun(e) {
    let tabIndex = this.data.tabIndex;
    let index = e.currentTarget.dataset.idx;
    let cpnId = this.data.dataList[index].id;
    wx.navigateTo({
      url: '/pages/mydetails/mydetails?tabIndex=' + tabIndex +'&cpnId='+cpnId
    })
  }
})