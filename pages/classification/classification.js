var app = getApp()
Page({
  data: {
    classifyNavId: 0,
  },
  onLoad: function() {
    let that = this;
    app.http.post_from('goods/getGoodsCatData', '').then(res => { //获取商品分类列表
      let goodsCat = res.data.goodsCat;
      let len = goodsCat[0].secGoodsCatList;

      var goodsCat2 = [];//创建便利后的图片数组
      let secGoodsCatList = [];

      for (let i = 0; i < goodsCat.length; i++) {
        goodsCat2.push({
          secGoodsCatList
        })
      }

      for (let i = 0; i < len.length; i++) {
        for (let j = 0; j < len[i].thirdGoodsCatList.length; j++) {
          var element = len[i].thirdGoodsCatList[j].image;
          let t = app.util.formatImg(element)
          len[i].thirdGoodsCatList[j].image = t;//图片格式化
          goodsCat2[0].secGoodsCatList = len;
        }
      }
      that.setData({
        goodsCat: goodsCat,
        goodsCat2: goodsCat2,
        secGoodsCatList: secGoodsCatList
      })
    }).catch(e => {
      console.log(e);
    })
  },
  classifyIDFun(e){
    let idx = e.currentTarget.dataset.id;
    let goodsCat2 = this.data.goodsCat2;
    let goodsCat = this.data.goodsCat;
    let len = goodsCat[idx].secGoodsCatList;
    let secGoodsCatList = this.data.secGoodsCatList;

    if (goodsCat2[idx].secGoodsCatList==''){
      for (let i = 0; i < len.length; i++) {
        for (let j = 0; j < len[i].thirdGoodsCatList.length; j++) {
          var element = len[i].thirdGoodsCatList[j].image;
          let t = app.util.formatImg(element)
          if (t == 'null?x-oss-process=image/resize,w_357') {
            t = '/static/images/default.png'
          }
          len[i].thirdGoodsCatList[j].image = t;//图片格式化

          goodsCat2[idx].secGoodsCatList = len;
        }
      }
    }

    this.setData({
      classifyNavId: idx,
      goodsCat2: goodsCat2,
      goodsCat: goodsCat
    })
  },
  ify_jump(e) {
    wx.setStorageSync('catId', e.target.dataset.id);
    wx.navigateTo({
      url: '/pages/classification_search/search?catId='+ e.target.dataset.id
    })
  },
  navigate(){
    wx.navigateTo({
      url: '/pages/search/search',
    })
  }
})