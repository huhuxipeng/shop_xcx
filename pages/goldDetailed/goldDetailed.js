var app = getApp()
Page({
  data: {
    sele:0,
    coinType: 0,
    memberCoinDetails: [],
    memberCoinNum: {},
    time:[],
  },
  onLoad: function (options) {
    this.requestFun();
  },
  seleClick(e) {
    let that = this;
    let coinType = that.data.coinType;
    let idx = e.target.dataset.idx;
    if (idx == 0) {
      coinType = 0;
    } else if (idx == 1) {
      coinType = 1;
    } else if (idx == 2) {
      coinType = 2;
    }
    that.setData({
      sele: idx,
      coinType: coinType,
    })
    that.requestFun();
  },
  requestFun(){
    let that = this;
    let parameter = {
      token: app.util.token,
      coinType: that.data.coinType,
    };
    app.http.post_from('/member/memberCoinDetails', parameter).then(res => { //获取商品分类列表
      let memberCoinDetails = res.data.res_data.memberCoinDetails;
      console.log('呵呵呵', memberCoinDetails)
      let memberCoinNum = res.data.res_data.memberCoinNum;
      let time = that.data.time;
     
      let gettime = new Date().getTime();
      for (let i = 0; i < memberCoinDetails.length; i++) {
        let createTime = memberCoinDetails[i].createTime;
        if (memberCoinDetails[i].coinNum>0){
          memberCoinDetails[i].coinNum = '+' + memberCoinDetails[i].coinNum
        }

        var date = new Date(createTime);
        var Y = date.getFullYear() + '-';
        var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
        var D = date.getDate() + ' ';
        var h = date.getHours() + ':';
        var m = date.getMinutes() + ':';
        var s = date.getSeconds();
        time.push(Y + M + D + h + m + s);
      }

      that.setData({
        memberCoinDetails: memberCoinDetails,
        memberCoinNum: memberCoinNum,
        time: time,
      })
      console.log('哈哈哈', that.data.memberCoinDetails)
    }).catch(e => {
      console.log(e);
    })

  }
})