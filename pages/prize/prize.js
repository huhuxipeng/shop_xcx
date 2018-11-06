var app = getApp()
Page({
  data: {
    parameter: { //购物车精品推荐-组件参数
      url: 'goods/anon/recommendedGoods',
      pageNo: 1,
      pageSize: 10,
      typeCode: 3002,
    },
    popup_number: false,
    popup_notes: false,
  },
  onLoad(options){
    //获取精品推荐组件id
    let tempList = this.selectComponent("#tempList");
    tempList.init();

    let parameter={
      activityId: options.activityId,
      orderId: options.orderId,
      token: app.util.token
    }

    app.http.post_from('/spell/getSnatchDetail',parameter).then(res => {
      console.log(res)
      let activity = res.data.res_data.activity;//夺宝商品
      let message = res.data.res_data.message;//中奖未中奖提示
      let mySnatchNoList = res.data.res_data.mySnatchNoList;//我的夺宝号
      let winSnatchNoList = res.data.res_data.winSnatchNoList;//中奖名单

      for (var i in winSnatchNoList) {
        let front = winSnatchNoList[i].mobile.substr(0, 4);
        let after = winSnatchNoList[i].mobile.substr(9, 2);
        winSnatchNoList[i].mobile = front + '*****' + after
      }

      this.setData({
        activity: activity,
        message: message,
        mySnatchNoList: mySnatchNoList,
        winSnatchNoList: winSnatchNoList,
      })
    })
  },
  onReachBottom: function (e) { //拉到底部时调用加载数据函数
    let tempList = this.selectComponent("#tempList");
    tempList.roll();
  },
  moreFun(e){
    let id = e.currentTarget.dataset.id;
    if(id==0){
      this.setData({
        popup_number: true,
      })
    }else if(id==1){
      this.setData({
        popup_notes: true,
      })
    }
  },
  popupFun(){
    this.setData({
      popup_number: false,
      popup_notes:false,
    })
  }
})