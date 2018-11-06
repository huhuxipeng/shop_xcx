var app = getApp()
Page({
  data: {
    parameter: '',
    tabPosition: -1,
    goodsSort: true,//判断是否出现综合-价格-时间-销量(未完成，要判断是首页进来还是商品分类进来)
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
    list: [],
    no_hide: false,
    pages: false,
    catId: '', //商品类别id
    searchs: "", //搜索
    pageNo: 1, //页码
    url: 'goods/getGoodsByCatId',
    searchUrl: 'goods/selectGoodsByParams',
    searchState: false,
    searchPage: 1,
    goodName: '',
    sort: 1, //0：升序，1：降序
    sort1: 1, //0：升序，1：降序
    sort2: 1, //0：升序，1：降序
    sort3: 1, //0：升序，1：降序
    orderType: '', //price(价格)，create_time(时间)，buy_count(销售量)
    nodata: false,  //没有数据
    ReachBottom: false  //滚动状态
  },
  bindKeyInput(e) {
    this.setData({
      goodName: e.detail.value
    })
  },
  searchClick(e) {
    let that = this;
    let goodName = that.data.goodName;
    if (goodName == '') {
      wx.showToast({
        title: '搜索内容不能为空',
        icon: 'none',
        duration: 1200
      })
      return false
    }
    that.setData({
      list: '',
      searchPage: 1,
      no_hide: false
    })
    this.searchFun();
  },
  searchFun(){  //搜索
    let that = this;
    let list = that.data.list;
    let that_pageNo = that.data.searchPage;
    let searchState = that.data.searchState;
    let pageNo = that.data.pageNo;
    let goodName = that.data.goodName;
    let ReachBottom = that.data.ReachBottom;
    
    if (searchState == false) {//是搜索状态还是tab状态
      that.setData({
        list: '',
        searchPage: 1,
        no_hide: false
      })
      wx.pageScrollTo({//回到顶部
        scrollTop: 0,
        duration: 0
      })
    }
    that.setData({
      searchState: true,
      pageNo: 1
    })
    let parameter = {
      goodName: that.data.goodName, //搜索文案
      pageNo: that_pageNo, //页码
      pageSize: 10,
    };
    
    app.http.post_from(that.data.searchUrl, parameter).then(res => { //获取商品分类列表
      let dataList = res.data.res_data.dataList;
      let len = res.data.res_data.dataList.length;
      if (ReachBottom==false){//非滚动加载的时候
        if(dataList==''){
          that.setData({
            nodata: true
          })
        }else{
          that.setData({
            nodata: false
          })
        }
      }
      if (len > 0) {
        for (let i = 0; i < len; i++) {
          dataList[i].redPoint = app.util.strings(dataList[i].redPoint);
          dataList[i].mktprice = app.util.strings(dataList[i].mktprice);
          dataList[i].price = app.util.strings(dataList[i].price);
          let element = res.data.res_data.dataList[i].image;
          let t = app.util.formatImg(element)
          dataList[i].image = t;//图片格式化
          if (that_pageNo > 1) {
            list.push(dataList[i])//赋值
          }
        }
        if (that_pageNo > 1) {//大于1添加
          that.setData({//赋值
            list: list,
            ReachBottom: false
          })
        } else {//小于1覆盖
          that.setData({//赋值
            list: dataList,
            ReachBottom: false
          })
        }
      } else {
        that.setData({
          no_hide: true,
          ReachBottom: false
        })
      }
    }).catch(e => {
      console.log(e);
    })
  },
  onLoad: function(options) {
    this.searchFun();
  },
  tabFun(e) {
    wx.pageScrollTo({//回到顶部
      scrollTop: 0,
      duration: 0
    })
    let idx = e.target.dataset.idx;
    var tsTab = 'tab[' + idx + '].rise';
    var tsRise = this.data.tab[idx].rise;
    tsRise = !tsRise;
    this.setData({
      tabPosition: idx,
      [tsTab]: tsRise,
      no_hide: false
    })
  },
  tabFun2() {
    wx.pageScrollTo({//回到顶部
      scrollTop: 0,
      duration: 0
    })
    this.setData({
      tabPosition: -1,
      no_hide: false
    })
  },
  searchReach(){//搜索后滚动到底部翻页
    let searchPage = this.data.searchPage;
    searchPage += 1;
    this.setData({
      searchPage: searchPage
    })
    this.searchFun();
  },
  onReachBottom: function (e) { //拉到底部时调用加载数据函数
    let no_hide = this.data.no_hide;
    if (no_hide==false){
      if (this.data.searchState) {
        this.setData({
          ReachBottom: true
        })
        this.searchReach();
      } else {
        this.setData({
          pages: true
        })
      }
    }
  },
  listClick(e){
    let idx = e.currentTarget.dataset.idx;
    let goodsId='';
    if (this.data.list[idx].goodsId){
      goodsId = this.data.list[idx].goodsId
    } else if (this.data.list[idx].goods_id) {
      goodsId = this.data.list[idx].goods_id
    }
    wx.navigateTo({
      url: '/pages/details/details?goodsId=' + goodsId
    })
  }
})