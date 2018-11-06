var app = getApp()
Page({
  data: {
    pageFloorList: [],
    moudelLength: 7,
    mername: '金币兑好礼',
  },
  onLoad(e) {
    let that = this;
    let params = {
      relId: e.relId,
      relType: 3
    }
    app.http.post_from('basics/anon/getPageDataByRelInfo', params).then(res => { //获取商品分类列表
      that.setData({
        mername: res.data.res_data.pageName,
      })
      let pageFloorList = res.data.res_data.pageFloorList.map(o => {
        o.pageFloorModuleList.forEach(element => {
          if (o.modelId == 1002) {
            element.pic = app.util.formatImg(element.pic) //一屏幕大小的图片
          } else {
            element.pic = app.util.formatImg(element.pic, 2) //小于半屏的图片
          }
        });
        let wh = o.modelWidth / o.modelHight;
        o.height = 750 / wh + 'rpx';
        return o;
      })
      that.setData({
        pageFloorList: pageFloorList,
      })
      wx.setNavigationBarTitle({ title: that.data.mername })

      let parameter = {
        pageNo: 1,
        pageSize: 10,
        pageId: res.data.res_data.pageId
      }
      app.http.post_from('basics/anon/getPageGoodsListByPageId', parameter).then(res => {
        let pageFloorList = res.data.res_data.pageFloorList;
        console.log('哈哈哈',pageFloorList)
        for (var i in pageFloorList){
          pageFloorList[i].price = app.util.strings(pageFloorList[i].price)
          pageFloorList[i].mktprice = app.util.strings(pageFloorList[i].mktprice)
          pageFloorList[i].image = app.util.formatImg(pageFloorList[i].image)
        }
        that.setData({
          specialList: pageFloorList
        })
      })
    }).catch(e => {
      console.log(e);
    })

  },
  onReachBottom: function () {
    let length = this.data.moudelLength + 7
    this.setData({
      moudelLength: length
    });
  },
  navFun(e){
    console.log('哈哈',e)
    let idx = e.currentTarget.dataset.idx;
    let goodsId = this.data.specialList[idx].goodsId;

    wx.navigateTo({
      url: '/pages/details/details?goodsId=' + goodsId
    })
  }
})