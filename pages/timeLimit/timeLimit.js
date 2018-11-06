var app = getApp()
Page({
  data: {
    idx: 0,
    state: [],
    time: [],
    reverse: '',
    activityList: [],
    dataList: [],
    value: '',
    notice: false
  },
  onLoad() {
    this.ActivityList();
  },
  ActivityList() {
    let that = this;
    let parameter = {};
    app.http.post_from('flashsale/anon/getFlashsaleActivityList', parameter).then(res => { //限时活动
      let activityList = res.data.res_data.activityList; //活动列表
      let dataState = that.data.state;
      let time = that.data.time;
      console.log('发', activityList)
      for (let i = 0; i < activityList.length; i++) {
        if (activityList[i].flag == 0) {
          dataState.push('已开抢')
          time.push(that.timeFun(activityList[i].beginTime))
        }else if (activityList[i].flag == 1) {
          that.setData({
            idx: i,
            flag: i
          })
          time.push(that.timeFun(activityList[i].beginTime))
          dataState.push('抢购中')
          that.reverse(activityList[i].beginTime, activityList[i].nowTime);
        }else if (activityList[i].flag == 2) {
          dataState.push('即将开抢')
          time.push(that.timeFun(activityList[i].beginTime))
        }
      }
      that.setData({
        activityList: activityList,
        state: dataState,
        time: time
      })
      that.GoodsList(that.data.idx);
    }).catch(e => {
      console.log(e);
    })
  },
  GoodsList(idx) {
    let that = this;
    let flashsaleId = that.data.activityList[idx].flashsaleId;
    that.setData({
      flashsaleId: flashsaleId
    })
    let parameter = {
      flashsaleId: flashsaleId,
      pageNo: 1,
      pageSize: 10
    };
    app.http.post_from('flashsale/anon/getFlashsaleGoodsList', parameter).then(res => { //商品列表
      let dataList = res.data.res_data.dataList;
      let activityList = that.data.activityList;
      let idx = that.data.idx;

      for (let i = 0; i < dataList.length; i++) {
        let element = dataList[i].goodsImage;
        let t = app.util.formatImg(element)
        dataList[i].image = t; //图片格式化
        if (i > idx) {
          dataList[i].flag = i;
        }
        // console.log('哈哈哈2', i)
      }

      that.setData({
        dataList: dataList,
        flashsaleId,
      })
    }).catch(e => {
      console.log(e);
    })
  },
  buyNow(e) {
    let idx = e.currentTarget.dataset.idx;
    if (this.data.dataList[idx].activityStock != 0) {
      let item = e.currentTarget.dataset.item;
      let options = {
        flashsaleGoodsId: item.flashsaleGoodsId,
        goodsId: item.goodsId,
        flashsaleId: this.data.flashsaleId,
      }
      let queryParams = '?'
      for (var i in options) {
        queryParams += i + '=' + options[i] + '&'
      }
      let url = "/pages/details/details" + queryParams
      wx.navigateTo({
        url: url,
      })
    } else {
      wx.showToast({
        title: '已抢完',
        icon: 'none',
        duration: 1200
      })
    }
  },
  noticeFun(e) { //开抢提醒设置弹窗
    console.log(e)
    let idx = e.currentTarget.dataset.idx;
    this.setData({
      notice: true,
      txIdx: idx,
    })
  },
  cancelFun() { //取消
    this.setData({
      notice: false
    })
  },
  sureFun() { //确定
    let that = this;
    let value = that.data.value;
    var myreg = /^[1][3,4,5,7,8][0-9]{9}$/;
    if (value == '') {
      wx.showToast({
        title: '内容不能为空',
        icon: 'none',
        duration: 1200
      })
    } else {
      if (!myreg.test(value)) {
        wx.showToast({
          title: '手机格式不正确',
          icon: 'none',
          duration: 1200
        })
      } else {
        let dataList = that.data.dataList;
        let txIdx = that.data.txIdx;
        let parameter = {
          flashsaleGoodsId: dataList[txIdx].flashsaleGoodsId,
          flashsaleId: that.data.flashsaleId,
          mobile: value
        };
        app.http.post_from('flashsale/anon/flashsaleNotify', parameter).then(res => { //开抢提醒
          console.log('开抢提醒', res)

          wx.showToast({
            title: res.data.res_info,
            icon: 'none',
            duration: 2000
          })
          this.setData({
            notice: false
          })
        }).catch(e => {
          console.log(e);
        })
      }
    }
  },
  bindKeyInput(e) {
    let value = e.detail.value;
    this.setData({
      value: value
    })
  },
  reverse(beginTime, nowTime) { //倒计时
    console.log('破', beginTime + nowTime)
    let that = this;
    if (beginTime != null) {
      if (beginTime - nowTime > 0) {
        let s = beginTime - nowTime;
        that.data.setInver = setInterval(function() {
          s = s - 1000; //时间差
          let day = Math.floor(s / 86400000);
          let hour = Math.floor(s / 3600000);
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
            that.ActivityList();
          }
          that.setData({
            reverse: format
          })
        }, 1000);
      }
    }
  },
  timeFun(beginTime) { //活动时间
    let date = new Date(beginTime);
    let Y = date.getFullYear() + '-';
    let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    let D = date.getDate() + ' ';
    let h = date.getHours() + ':';
    let m = date.getMinutes() + '';
    let s = date.getSeconds();
    let sj = h + m + s;
    return sj;
  },
  boxFun(e) { //tab点击
    let idx = e.target.dataset.idx;
    this.setData({
      idx: idx
    })
    this.GoodsList(idx);
  },
  onUnload() {
    if (this.data.setInver) {
      clearInterval(this.data.setInver)
    }
  },
  onHide() {
    if (this.data.setInver) {
      clearInterval(this.data.setInver)
    }
  },
})