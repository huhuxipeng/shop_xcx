var app = getApp()
Page({
  data: {
    no_hide: false,
    list: [],
    parameter: '',
    len: true,
  },
  onShow() {
    this.format();
  },
  format() {
    let that = this;
    let list = that.data.list;

    let parameter = {
      token: app.util.token,
      pageNo: 0,
      pageSize: 0
    }

    app.http.post_from('goods/getGiftPackageList', parameter).then(res => { //获取推荐列表
      let dataList = res.data.res_data.dataList;
      let len = res.data.res_data.dataList.length;

      //拿到数据，做购物车的精品推荐数据对接
      if (len > 0) {
        for (let i = 0; i < len; i++) {
          dataList[i].price = app.util.strings(dataList[i].price);
          dataList[i].mktprice = app.util.strings(dataList[i].mktprice);
          dataList[i].redPoint = app.util.strings(dataList[i].redPoint);

          let element = res.data.res_data.dataList[i].image;
          let t = app.util.formatImg(element)
          dataList[i].image = t; //图片格式化
          list.push(dataList[i]) //赋值
          that.setData({ //赋值
            list: list
          })
        }
      } else {
        let len = this.data.len;
        that.setData({
          no_hide: true,
          len: false
        })
      }
    }).catch(e => {
      console.log(e);
    })
  },
  wrapListClick(e) {//跳转店长礼包详情
    let idx = e.currentTarget.dataset.idx;
    let gpId = '';
    gpId = this.data.list[idx].gpId

    wx.navigateTo({
      url: '/pages/giftDetails/giftDetails?gpId=' + gpId
    })
  },
})