var app = getApp()
var util = require('../../api/util.js')
var d = require('date.js')
var CN_Date = require('getCNDate.js');
var t = new Date();
Page({
  data: {
    qdBtn: "签到领金币",
    arr: [],
    qiandaoSuccess: false,
    monthNum: t.getMonth() + 1,
    yearNum: t.getFullYear(),
    MonthDayArray: [],
    toDate: t.getDate(),
    toMonth: t.getMonth() + 1,
    toYear: t.getFullYear(),
  },
  onLoad() {
    let that = this;
    var date = new Date;
    var month = date.getMonth() + 1;
    let parameter = {
      month: month,
      token: app.util.token,
    }
    app.http.post_from('member/returnSignAndCoin', parameter).then(res => {
      let res_data = res.data.res_data;
      let arr = [];
      var date = new Date();
      var strDate = date.getDate();//当前日期

      for (let i = 0; i < res_data.signList.length; i++) {
        var date = new Date(res_data.signList[i].createTime);
        var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
        var D = date.getDate() + ' ';

        if (D == strDate){
          that.setData({
            qdBtn:'已签到'
          })
        }
        arr.push(parseInt(D))
      }

      that.setData({
        res_data: res_data,
        arr: arr
      })
      this.calcMonthDayArray();
    }).catch(e => {
      console.log(e);
    })
  },
  qdBtnFun(){ //签到
    let that = this;
    let parameter = {
      coinType: 5,
      token: app.util.token,
    }
    app.http.post_from('/member/sign', parameter).then(res => {
      let res_info = res.data.res_info;
      if (res_info == '已签到'){
        wx.showToast({
          title: '已签到',
          icon: 'none',
        })
      } else {
        that.setData({
          qiandaoSuccess: true
        })
      }
    }).catch(e => {
      console.log(e);
    })
  },
  knowFun(){  //知道了
    this.setData({
      qiandaoSuccess: false
    })
    this.onLoad();
  },
  icon13Fun() {
    this.lastMonth_Fn();
  },
  icon14Fun() {
    this.nextMonth_Fn();
  },

  monthTouch: function(e) {
    var beginX = e.target.offsetLeft;
    var endX = e.changedTouches[0].clientX;
    if (beginX - endX > 80) {
      this.nextMonth_Fn();
    } else if (beginX - endX < -80) {
      this.lastMonth_Fn();
    }
  },

  nextMonth_Fn: function() {
    var n = this.data.monthNum;
    var y = this.data.yearNum;
    if (n == 12) {
      this.setData({
        monthNum: 1,
        yearNum: y + 1,
      });
    } else {
      this.setData({
        monthNum: n + 1,
      });
    }
    this.calcMonthDayArray();
  },

  lastMonth_Fn: function() {
    var n = this.data.monthNum;
    var y = this.data.yearNum;
    if (n == 1) {
      this.setData({
        monthNum: 12,
        yearNum: y - 1,
      });
    } else {
      this.setData({
        monthNum: n - 1,
      });
    }
    this.calcMonthDayArray();
  },

  calcMonthDayArray: function() {
    var data = this.data;
    let arr = data.arr;
    var dateArray = d.paintCalendarArray(data.monthNum, data.yearNum);

    //如果是当年当月
    var notToday = (data.monthNum != t.getMonth() + 1 || data.yearNum != t.getFullYear());
    if (!notToday) {
      for (var i in arr) {
        for (var j in dateArray) {
          for (var k in dateArray[j]) {
            if (dateArray[j][k].num == arr[i]) {
              dateArray[j][k].isToday = true;
            }
          }
        }
      }     
    }
    
    this.setData({
      MonthDayArray: dateArray,
      toYear: notToday ? this.data.yearNum : t.getFullYear(),
      toMonth: notToday ? this.data.monthNum : t.getMonth() + 1,
    })
  },
})