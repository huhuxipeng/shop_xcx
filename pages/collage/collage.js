var app = getApp()
Page({
  data: {
    tabPosition: -1,
    tabIndex: 0,
    tab: [{
        name: '价格',
        rise: true
      },
      {
        name: '时间',
        rise: true
      },
      {
        name: '销量',
        rise: true
      }
    ],
    sort: 0, //0：升序，1：降序
    sort1: 1, //0：升序，1：降序
    sort2: 1, //0：升序，1：降序
    sort3: 1, //0：升序，1：降序
  },
  onShow(){
    this.listFun();
  },
  listFun(){
    let that = this;
    let parameter = {
      pageNo: 0,
      pageSize: 0,
      sortType: that.data.tabIndex,
      sortWay: that.data.sort,
    };
    console.log('123')
    app.http.post_from('spell/anon/getSpellActivityPage', parameter).then(res => {
      let recommendedList = res.data.res_data.recommendedList;
      let spellActivityList = res.data.res_data.spellActivityList;

      for (let i = 0; i < recommendedList.length; i++) {
        recommendedList[i].spellPrice = app.util.strings(recommendedList[i].spellPrice);
      }
      for (let i = 0; i < spellActivityList.length; i++) {
        spellActivityList[i].spellPrice = app.util.strings(spellActivityList[i].spellPrice);
      }
      
      that.setData({
        recommendedList: recommendedList,
        spellActivityList: spellActivityList
      })

    }).catch(e => {
      console.log(e);
    })
  },
  tabFun(e) {
    wx.pageScrollTo({//回到顶部
      scrollTop: 0,
      duration: 0
    })
    let idx = e.currentTarget.dataset.idx;
    var tsTab = 'tab[' + idx + '].rise';
    var tsRise = this.data.tab[idx].rise;
    tsRise = !tsRise;
    this.setData({
      tabPosition: idx,
      [tsTab]: tsRise,
    })
    this.tabClick(this.data.tabPosition);
  },
  tabFun2() {
    wx.pageScrollTo({//回到顶部
      scrollTop: 0,
      duration: 0
    })
    this.setData({
      tabPosition: -1,
    })
    this.tabClick(this.data.tabPosition);
  },
  tabClick(idx) {
    let url = this.data.url;
    let pageNo = this.data.pageNo;
    let tabIndex = this.data.tabIndex;
    let sort = this.data.sort;
    let sort1 = this.data.sort1;
    let sort2 = this.data.sort2;
    let sort3 = this.data.sort3;
    let pages = this.data.pages;
    switch (idx) {//点击的是哪个类型商品（综合-价格-时间-销量）
      case -1:
        sort = sort1 = 0;
        tabIndex = 0;
        break;
      case 0:
        tabIndex = 1;
        if (sort1 == 1) { sort = sort1 = 0; } else { sort = sort1 = 1; }
        break;
      case 1:
        tabIndex = 2;
        if (sort2 == 1) { sort = sort2 = 0; } else { sort = sort2 = 1; }
        break;
      case 2:
        tabIndex = 3;
        if (sort3 == 1) { sort = sort3 = 0; } else { sort = sort3 = 1; }
        break;
    }
    if (pages == true) {//拉倒底部的话页数加一
      pageNo += 1
    } else {
      pageNo = 1;
    }
    this.setData({
      tabIndex: tabIndex,
      pageNo: pageNo,
      sort: sort,
      sort1: sort1,
      sort2: sort2,
      sort3: sort3,
      pages: false
    })
    this.listFun();
  },
  conductFun(e) {
    let idx = e.currentTarget.dataset.idx;
    let activityId = this.data.recommendedList[idx].activityId;
    wx.navigateTo({
      url: '/pages/collageDetails/collageDetails?activityId=' + activityId
    })
  },
  listBoxFun(e) {
    let idx = e.currentTarget.dataset.idx;
    let activityId = this.data.spellActivityList[idx].activityId;
    wx.navigateTo({
      url: '/pages/collageDetails/collageDetails?activityId=' + activityId
    })
  },
})