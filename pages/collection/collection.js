var app = getApp()
Page({
  data: {
    empty: true,
    parameter: { //精品推荐-组件参数
      url: 'goods/anon/recommendedGoods',
      pageNo: 1,
      pageSize: 10,
      typeCode: 3007,
    },
    shops: [],
  },
  onShow() {
    this.goodsCollectionList();
  },
  goodsCollectionList(){//收藏列表
    let that = this;
    let parameter = {
      token: app.util.token,
      pageNo: 1,
      pageSize: 10
    }
    app.http.post_from('goods/goodsCollectionList', parameter).then(res => { //获取收藏列表
      var dataList = res.data.res_data.dataList;
      var len = dataList.length;
      console.log(dataList)

      if (len != 0) { //有数据
        that.setData({
          empty: true
        })
      } else {
        that.setData({
          empty: false
        })
        //获取精品推荐组件id
        let tempList = this.selectComponent("#tempList");
        tempList.init();
        return false;
      }

      for (let i = 0; i < len; i++) {
        dataList[i].price = app.util.strings(dataList[i].price);
        dataList[i].mktprice = app.util.strings(dataList[i].mktprice);

        let element = dataList[i].image;
        let t = app.util.formatImg(element)
        dataList[i].image = t; //图片格式化
      }
      that.setData({
        shops: dataList
      })


    }).catch(e => {
      console.log(e);
    })
  },
  cancelFun(e) { //取消收藏
    let that = this;
    let idx = e.target.dataset.idx;
    let shops = that.data.shops;
    let goodsType = shops[idx].currencyId;
    let parameter = {
      currencyId: goodsType,
      flag: true,
      goodsType: 0,
      token: app.util.token,
    }
    app.http.post_from('goods/collectGoods', parameter).then(res => { //获取收藏列表
      var dataList = res.data.res_data.dataList;
      shops.splice(idx,1);
      wx.showToast({
        title: '取消收藏成功',
        icon: 'success',
        duration: 1200
      })

      that.setData({
        shops: shops
      })
      if (that.data.shops.length==0){
        that.goodsCollectionList();
      }
    }).catch(e => {
      console.log(e);
    })
  },
  onReachBottom: function(e) { //拉到底部时调用加载数据函数
    let that = this;
    let shops = that.data.shops;
    if (shops == '') {
      let tempList = that.selectComponent("#tempList");
      tempList.roll();
    }
  },
  navFun(e) {
    let idx = e.target.dataset.idx;
    let activityId = this.data.shops[idx].currencyId;
    wx.navigateTo({
      url: '/pages/collageDetails/collageDetails?activityId=' + activityId
    })
  }
})