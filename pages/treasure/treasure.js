var app = getApp()
Page({
  data: {
    animationData: {},
    setInter: '',

    bargainCarouselMessage: 'spell/anon/spellCarouselMessage', //夺宝轮播信息
    dataList: [],
    explain: false,
  },
  onShow() {
    this.treasure();

    var animation = wx.createAnimation({
      timingFunction: "linear",
      delay: 0
    })
    animation.translateX(375).step({ delay: 0, duration: 0 })
    this.setData({
      animationData: animation.export(),
      length: 375
    })
  },
  onHide() {
    console.log('清除定时器hide')
    clearInterval(this.data.setInter)
  },
  onUnload() {
    console.log('清除定时器unload')
    clearInterval(this.data.setInter)
  },
  treasure() {
    var that = this;
    let getSpellSnatchPage = {
      pageNo: 0,
      pageSize: 0,
      sortType: 0,
      sortWay: 0,
    }
    app.http.post_from('spell/anon/getSpellSnatchPage', getSpellSnatchPage).then(res => { //获取轮播数据
      let spellActivityList = res.data.res_data.spellActivityList;
      for (let i = 0; i < spellActivityList.length; i++) {
        spellActivityList[i].spellPrice = app.util.strings(spellActivityList[i].spellPrice);
      }
      that.setData({
        spellActivityList: spellActivityList
      })

    }).catch(e => {
      console.log(e);
    })

    let parameter = {
      pageNo: 0,
      pageSize: 20,
    }
    app.http.post_from(that.data.bargainCarouselMessage, parameter).then(res => { //获取轮播数据
      let dataList = res.data.res_data.dataList;
      that.setData({
        dataList: dataList
      })

      var animation = wx.createAnimation({
        timingFunction: "linear",
        delay: 0
      })
      var query = wx.createSelectorQuery();
      query.select('.marquee_text').boundingClientRect(function (rect) {
        console.log('宽度', rect.width)
        that.setData({
          length: parseInt(rect.width * (dataList.length + 2))
        })
        var length = that.data.length; //文字长度

        animation.translateX(-length).step({ duration: 100000 }).translateX(375).step({ delay: 0, duration: 0 })
        that.setData({
          animationData: animation.export(),
        })
        that.data.setInter = setInterval(function () {
          console.log('设置定时器')
          animation.translateX(-length).step({ delay: 0, duration: 100000 }).translateX(375).step({ delay: 0, duration: 0 })
          that.setData({
            animationData: animation.export()
          })
        }, 100100)

        wx.hideLoading();
      }).exec();


    }).catch(e => {
      console.log(e);
    })
  },


  listBoxFun(e){
    console.log(e)
    let idx = e.currentTarget.dataset.idx;
    let activityId = this.data.spellActivityList[idx].activityId;
    wx.navigateTo({
      url: '/pages/treasureDetails/treasureDetails?activityId=' + activityId
    })
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


})