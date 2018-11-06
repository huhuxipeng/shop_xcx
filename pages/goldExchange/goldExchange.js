var app = getApp()
Page({
  data: {
    idx: 0,
    max: 10000000,
    min: 0,
    rows:[],
    memberCoin: 0,
    goldBtn: true
  },
  onShow: function (options) {
    this.requestFun()
  },
  toChangeGold(e){
    let activityNum = e.currentTarget.dataset.item.activityNum;
    let goldChangerId = e.currentTarget.dataset.item.id
    wx.navigateTo({
      url: '/pages/details/details?goldChangerId=' + goldChangerId + '&activityNum=' + activityNum,
    })
  },
  requestFun() {
    let that = this;
    let parameter = {
      max: that.data.max,
      min: that.data.min,
      pageNo: 1,
      pageSize: 10,
      token: app.util.token,
    };
    app.http.post_from('goods/anon/pageCoinExchangeGoods', parameter).then(res => { //获取商品分类列表
      let rows = res.data.res_data.coinExchangeGoodsList.rows;
      let memberCoin = res.data.res_data.memberCoin;
      console.log('水电费', rows)

      for (var i in rows){
        if (rows[i].activityNum==0){
          rows[i].activityNum = '已兑完'
        }else{
          rows[i].activityNum = '立即兑换'
        }
      }
      
      that.setData({
        rows: rows,
        memberCoin: memberCoin
      })
    }).catch(e => {
      console.log(e);
    })
  },
  tabBtnFun(e){
    let idx = e.target.dataset.idx;
    let max = this.data.max;
    let min = this.data.min;

    if(idx==0){
      max = 10000000;
      min= 0;
    } else if (idx == 1) {
      max = 999;
      min = 0;
    } else if (idx == 2) {
      max = 2999;
      min = 1000;
    } else if (idx == 3) {
      max = 5999;
      min = 3000;
    } else if (idx == 4) {
      max = 9999;
      min = 6000;
    } else if (idx == 5) {
      max = 99999999;
      min = 10000;
    }

    this.setData({
      idx: idx,
      max: max,
      min: min
    })
    this.requestFun();
  },
})