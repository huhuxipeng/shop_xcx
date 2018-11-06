// pages/groupTime/index.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detail: '',
    times: '00:00:00',
    setInver: '',
    isInvite: false, //是否是分享页面点击进来的
    show: false,
    data: {}, //选规格相关数据
    showMast:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow(){
    if (this.data.noFirst){
      this.getSpellDetail();
    }else{
      this.data.noFirst = true;
    }
  },
  onLoad: function(options) {
    this.setData(options)
    this.getSpellDetail();
   
  },
  settime(t) {
    if (t > 0) {
      let day = Math.floor(t / 86400000);
      let hourT = Math.floor(t % 86400000)
      let hour = Math.floor(hourT / 3600000);
      let min = Math.floor((t / 60000) % 60);
      let sec = Math.floor((t / 1000) % 60);
      hour = hour < 10 ? "0" + hour : hour;
      min = min < 10 ? "0" + min : min;
      sec = sec < 10 ? "0" + sec : sec;
      let format = "";
      if (day > 0) {
        format = `${day}天${hour}:${min}:${sec}`;
      }
      if (day <= 0 && hour > 0) {
        format = `${hour}:${min}:${sec}`;
      }
      if (day <= 0 && hour <= 0) {
        format = `${"00"}:${min}:${sec}`;
      }
      this.setData({
        times: format
      })
    }
  },
  getProductList() {
    let url = "/goods/anon/queryProductList"
    let params = {
      goodsId: this.data.detail.spell.goodsId,
    };
    app.http.post_from(url, params).then(o => {
      console.log(o);
      let data = o.data.res_data;
      data.good = this.data.detail.spell;
      data.good.price = data.good.spellPrice
      this.setData({
        data: data
      })
    })
  },
  getSpellDetail() {
    let url = '/spell/anon/getSpellDetail'
    // console.log('token', app.util.token)
    // console.log('token2', wx.getStorageSync('token'))
    let params = {
      spellId: this.data.spellId,
      token: app.util.token
    }
    app.http.post_from(url, params).then(o => {
      let detail = o.data.res_data
      detail.price = detail.spellPrice
      let data = {
        good: detail,
      }
      if (detail.spell.status == 3 || detail.spell.status == 2){//如果拼团失败，就删掉spellId，这样点击按钮就会变成开团
        delete detail.spell.spellId
      }
      this.setData({
        detail: detail,
      })
      this.data.setInver = setInterval(o => {
        let nowTime = new Date().getTime();
        let endTime = this.data.detail.spell.endDate;
        let t = endTime - nowTime;
        if (t >= 0) {
          this.settime(t)
        } else {
          clearInterval(this.data.setInver);
        }
      }, 1000)
      if (this.data.isInvite || detail.spell.status == 3 || detail.spell.status == 3) { //如果是分享页点击进来的用户,或者拼团失败重新开团
        this.getProductList(); //获取产品规格
      }
    }).catch(e => {
      console.log(url, e)
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onUnload() {
    clearInterval(this.data.setInver);
  },
  invite() { //邀请好友参团
    this.setData({
      showMast:true,
    })
  },
  hideMast(){
    this.setData({
      showMast: false,
    })
  },
  joinGroup() { //立即参团
    this.setData({
      show: true
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return app.util.share('')
  }
})