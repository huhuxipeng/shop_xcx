var app = getApp()
Page({
  data: {
    res_data: '',
    explain: false,
    groupPopup: false,
    participate: false,
    goodsId: '',
    format: '',
    day: '',
    hour: '',
    min: '',
    sec: '',
    show: false,
    participateDetails: [],
    time: '',
    time2: ''
  },
  onHide() {
    clearInterval(this.data.time)
    clearInterval(this.data.time2)
  },
  onUnload() {
    clearInterval(this.data.time)
    clearInterval(this.data.time2)
  },
  onShow(){
    if(this.data.noFirst){
      this.getDetail();
      return;
    }
    this.data.noFirst=true;
  },
  onLoad(options) {
    this.setData(options)
    this.getDetail();
  },
  getDetail(){
    let that = this;
    let parameter = {
      activityId: that.data.activityId,
      token: app.util.token,
    };
    app.http.post_from('/spell/anon/getActivityDetails', parameter).then(res => { //获取夺宝信息
      let res_data = res.data.res_data;
      let Ongoing = res_data.Ongoing;
      if (!Ongoing){
        Ongoing = []
      }
      let len = Ongoing.length;
      let endDateList = [];
      res_data.rulesArr = res_data.rules.split('\r\n').map(o=>{
        if(o.indexOf('u')!=-1){
          o = o.substr(1)
        }
        return o;
      });
      for (let i = 0; i < len; i++) {
        Ongoing[i].participateNum = res_data.num - Ongoing[i].participateNum;
        let endDate = Ongoing[i].endDate
        endDateList.push(endDate)
      }

      if (endDateList.length > 0) {
        that.data.time = setInterval(function () {
          for (var i in endDateList) {
            let endDate = endDateList[i];
            let nowTime = new Date().getTime();
            let s;
            if (endDate - nowTime > 0) {
              s = endDate - nowTime;
            }
            s = s - 1000; //时间差
            let day = Math.floor(s / 86400000);
            let hourT = Math.floor(s % 86400000);
            let hour = Math.floor(hourT / 3600000);
            let min = Math.floor((s / 60000) % 60);
            let sec = Math.floor((s / 1000) % 60);
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
            if (day <= 0 && hour <= 0 && min <= 0 && sec <= 0) { //结束
              day = '0';
              hour = '00';
              min = '00';
              sec = '00';
              clearInterval(that.data.time)
            }
            Ongoing[i].endDate = format;
            that.setData({
              Ongoing: Ongoing,
            })
          }
        }, 1000);
      }

      that.reverse(res_data.endDate); //结束倒计时
      res_data.spellPrice = app.util.strings(res_data.spellPrice);
      res_data.goodsPrice = app.util.strings(res_data.goodsPrice);
      let element = res_data.shopStoreLogo;
      let t = app.util.formatImg(element)
      res_data.shopStoreLogo = t; //图片格式化
      res_data.good = {
        image: res_data.image,
        price: res_data.spellPrice
      }
      that.setData({
        res_data: res_data,
        goodsId: res_data.goodsId,
        len: len
      })
    }).catch(e => {
      console.log(e);
    })
  },
  showFooterBuy() {
    if (this.data.res_data.goodsSpecList) {
      this.setData({
        show: true,
      })
      return;
    }
    let url = "/goods/anon/queryProductList"
    let params = {
      goodsId: this.data.res_data.goodsId
    }
    app.http.post_from(url, params).then(o => {
      let res_data = this.data.res_data;
      res_data.goodsSpecList = o.data.res_data.goodsSpecList;
      res_data.productList = o.data.res_data.productList;
      this.setData({
        show: true,
        res_data,
        
      })
    })
  },
  reverse(endDate) { //倒计时
    let that = this;
    let nowTime = new Date().getTime();
    if (endDate != null) {
      if (endDate - nowTime > 0) {
        let s = endDate - nowTime;
        that.data.time2 = setInterval(function() {
          s = s - 1000; //时间差
          let day = Math.floor(s / 86400000);
          let hour2 = Math.floor(s / 3600000);
          let hour = Math.floor(((hour2 * 3600000) - (day * 86400000)) / 3600000);
          let min = Math.floor((s / 60000) % 60);
          let sec = Math.floor((s / 1000) % 60);
          hour = hour < 10 ? "0" + hour : hour;
          min = min < 10 ? "0" + min : min;
          sec = sec < 10 ? "0" + sec : sec;
          let format = "";
          if (day > 0) {
            format = `${hour}:${min}:${sec}`;
          }
          if (day <= 0 && hour > 0) {
            format = `${hour}:${min}:${sec}`;
          }
          if (day <= 0 && hour <= 0) {
            format = `${"00"}:${min}:${sec}`;
          }
          if (day <= 0 && hour <= 0 && min <= 0 && sec <= 0) { //结束
            day = '0';
            hour = '00';
            min = '00';
            sec = '00';
            clearInterval(that.data.time2)
          }
          that.setData({
            day: day,
            hour: hour,
            min: min,
            sec: sec,
          })
        }, 1000);
      }
    }
  },
  ruleFun() {
    this.setData({
      explain: true
    })
  },
  closeRuleFun() {
    this.setData({
      explain: false
    })
  },
  serviceFun() { //客服
    app.serviceFun();
  },
  moreFun() {
    this.setData({
      groupPopup: true
    })
  },
  groupPopupFun() {
    this.setData({
      groupPopup: false
    })
  },
  groupBtn(e) {
    let idx = e.currentTarget.dataset.idx;
    let Ongoing = this.data.Ongoing;
    this.setData({
      participate: true,
      groupPopup: false,
      leftoverIdx: idx,
      leftoverQuota: Ongoing[idx].participateNum,
      participateDetails: Ongoing[idx].participateDetails,
      spellId: Ongoing[idx].spellId
    })
  },
  participateFun() {
    this.setData({
      participate: false
    })
  }
})