var app = getApp()
Page({
  data: {
    parameter: '',
    tabPosition: -1,
    couponList: [],
    showCouponDetail: false,
    goodsSort: true, //判断是否出现综合-价格-时间-销量(未完成，要判断是首页进来还是商品分类进来)
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
    spellinList: [],
    shopData: [],
    showErweiCodePopup: false,
    shopBond: '',
    no_hide: false,
    pages: false,
    goodsId: '', //商品类别id
    searchs: "", //搜索
    pageNo: 1, //页码
    shopStoreId: '', //店铺ID
    url: 'goods/shopStoreInfo',
    searchUrl: 'goods/selectGoodsByParams',
    spellingUrl: 'spell/anon/getActivityByShop',
    searchState: false,
    searchPage: 1,
    goodName: '',
    sort: 1, //0：升序，1：降序
    sort1: 1, //0：升序，1：降序
    sort2: 1, //0：升序，1：降序
    sort3: 1, //0：升序，1：降序
    orderType: '', //price(价格)，create_time(时间)，buy_count(销售量)
    nodata: false, //没有数据
    ReachBottom: false //滚动状态
  },
  showErweiCode() {
    this.setData({
      showErweiCodePopup: true
    })
  },
  closeErweiCodePopup() {
    this.setData({
      showErweiCodePopup: false
    })
  },
  preservation() { //生成图片方法
    let that = this;
    let img = this.data.shopData.twoCodeImg
    wx.getSetting({ //保存相册要授权
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              console.log('授权成功')
            }
          })
        }
      }
    })
    wx.downloadFile({
      url: img, //仅为示例，并非真实的资源that.data.imgObj[that.data.imgIndex].posterQrcodeImg
      success(res) {
        wx.saveImageToPhotosAlbum({ //保存生成的图片到手机相册里
          filePath: res.tempFilePath,
          success(res) {
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 2000
            })
          },
          fail(err) {
            that.setData({
              grant: true
            })
          }
        })
      }
    })
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
  pickNow(e) {
    this.setData({
      couponIndex: e.currentTarget.dataset.index,
      showCouponDetail: true
    })
  },
  getCouponList() { //
    let url = 'coupon/anon/couponList';
    let params = {
      pageNo: 0,
      pageSize: 0,
      relId: this.data.shopStoreId,
      relType: 2,
    }
    if (app.util.token) {
      params.token = app.util.token;
    }
    app.http.post_from(url, params).then(o => {
      let couponList = o.data.res_data.dataList;
      couponList.forEach(o => {
        switch (o.cpnType) {
          case 0:
            o.typName = '分类券';
            o.color = 'color_1';
            break;
          case 1:
            o.typName = '商品券';
            o.color = 'color_2';
            break;
          case 2:
            o.typName = '店铺券';
            o.color = 'color_3';
            break;
          case 3:
            o.typName = '通用券';
            o.color = 'color_1';
            break;
        }
        o.getBeginTime = new Date(o.getBeginTime).format('MM.dd');
        o.getEndTime = new Date(o.getEndTime).format('MM.dd');
        if (couponList.length == 2) { //样式展示判断
          o.type = 'type_2'
        }
      })
      this.setData({
        couponList
      })
    }).catch(e => {
      console.log('err', e)
    })
  },
  searchFun() { //搜索
    let that = this;
    let list = that.data.list;
    let that_pageNo = that.data.searchPage;
    let searchState = that.data.searchState;
    let pageNo = that.data.pageNo;
    let goodName = that.data.goodName;
    let ReachBottom = that.data.ReachBottom;

    if (searchState == false) { //是搜索状态还是tab状态
      that.setData({
        list: '',
        searchPage: 1,
        no_hide: false
      })
      wx.pageScrollTo({ //回到顶部
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
      if (ReachBottom == false) { //非滚动加载的时候
        if (dataList == '') {
          that.setData({
            nodata: true
          })
        } else {
          that.setData({
            nodata: false
          })
        }
      }
      if (len > 0) {
        for (let i = 0; i < len; i++) {
          dataList[i].price = app.util.strings(dataList[i].price);
          dataList[i].mktprice = app.util.strings(dataList[i].mktprice);
          dataList[i].redPoint = app.util.strings(dataList[i].redPoint);
          let element = res.data.res_data.dataList[i].image;
          let t = app.util.formatImg(element)
          dataList[i].image = t; //图片格式化
          if (that_pageNo > 1) {
            list.push(dataList[i]) //赋值
          }
        }
        if (that_pageNo > 1) { //大于1添加
          that.setData({ //赋值
            list: list,
            ReachBottom: false
          })
        } else { //小于1覆盖
          that.setData({ //赋值
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
    console.log(options)
    let that = this;
    let spellinList = that.data.spellinList;
    that.setData({
      goodsId: options.goodsId,
      // goodsId: 8202
    })
    let parameter = {
      goodsId: that.data.goodsId, //商品类别id
    };
    app.http.post_from(that.data.spellingUrl, parameter).then(res => { //获取店铺大家都在拼
      let activityList = res.data.res_data.activityList;
      let len = res.data.res_data.activityList.length;
      for (let i = 0; i < len; i++) {
        activityList[i].spellPrice = app.util.strings(activityList[i].spellPrice);
        // activityList[i].mktprice = app.util.strings(activityList[i].mktprice);
      }
      that.setData({
        spellinList: activityList
      })
    }).catch(e => {
      console.log(e);
    })
    that.format();
  },
  format() { //图片格式化-添加数据-加载更多
    let that = this;
    let list = that.data.list;
    let that_pageNo = that.data.pageNo;
    var tabPosition = that.data.tabPosition;
    var shopData = that.data.shopData;

    let parameter = {
      shopStoreId: that.data.shopStoreId, //店铺ID
      goodsId: that.data.goodsId, //商品类别id
      pageNo: that_pageNo, //页码
      pageSize: 10,
      sort: that.data.sort, //0：升序，1：降序
      searchs: that.data.searchs, //搜索
      orderType: that.data.orderType //price(价格)，create_time(时间)，buy_count(销售量)
    };
    let no_hide = that.data.no_hide;
    if (no_hide == false) {
      app.http.post_from(that.data.url, parameter).then(res => { //获取商品分类列表
        if (tabPosition == -1) {
          that.setData({
            shopData: res.data.res_data.shop,
            shopBond: res.data.res_data.bond,
            shopStoreId: res.data.res_data.shop.shopStoreId
          })
          this.getCouponList();
          var dataList = res.data.res_data.shopStoreGoodsList.rows;
          var len = res.data.res_data.shopStoreGoodsList.rows.length;
        } else {
          var dataList = res.data.res_data.dataList;
          var len = res.data.res_data.dataList.length;
        }

        if (len > 0) {
          for (let i = 0; i < len; i++) {
            dataList[i].redPoint = app.util.strings(dataList[i].redPoint);
            dataList[i].price = app.util.strings(dataList[i].price);
            dataList[i].mktprice = app.util.strings(dataList[i].mktprice);

            if (tabPosition == -1) {
              var element = res.data.res_data.shopStoreGoodsList.rows[i].image;
            } else {
              var element = res.data.res_data.dataList[i].image;
            }

            let t = app.util.formatImg(element)
            dataList[i].image = t; //图片格式化
            if (that_pageNo > 1) {
              list.push(dataList[i]) //赋值
            }
          }
          if (that_pageNo > 1) { //大于1添加
            that.setData({ //赋值
              list: list
            })
          } else { //小于1覆盖
            that.setData({ //赋值
              list: dataList
            })
          }
        } else {
          that.setData({
            no_hide: true
          })
        }
      }).catch(e => {
        console.log(e);
      })
    }
  },
  tabFun(e) {
    let idx = e.target.dataset.idx;
    var tsTab = 'tab[' + idx + '].rise';
    var tsRise = this.data.tab[idx].rise;
    tsRise = !tsRise;
    this.setData({
      tabPosition: idx,
      [tsTab]: tsRise,
      no_hide: false,
    })
    this.tabClick(this.data.tabPosition);
  },
  tabFun2(e) {
    this.setData({
      tabPosition: -1,
      no_hide: false,
    })
    this.tabClick(this.data.tabPosition);
  },
  tabClick(idx) {
    let searchState = this.data.searchState;
    let searchPage = this.data.searchPage;
    let orderType = this.data.orderType;
    let nodata = this.data.nodata;
    let url = this.data.url;
    let pageNo = this.data.pageNo;
    let sort = this.data.sort;
    let sort1 = this.data.sort1;
    let sort2 = this.data.sort2;
    let sort3 = this.data.sort3;
    let pages = this.data.pages;
    if (searchState == true) {
      this.setData({
        list: ''
      })
    }

    switch (idx) { //点击的是哪个类型商品（综合-价格-时间-销量）
      case -1:
        orderType = '';
        url = "goods/shopStoreInfo";
        break;
      case 0:
        orderType = 'price';
        url = "goods/orderGoods";
        if (sort1 == 1) {
          sort = sort1 = 0;
        } else {
          sort = sort1 = 1;
        }
        break;
      case 1:
        orderType = 'create_time';
        url = "goods/orderGoods";
        if (sort2 == 1) {
          sort = sort2 = 0;
        } else {
          sort = sort2 = 1;
        }
        break;
      case 2:
        orderType = 'buy_count';
        url = "goods/orderGoods";
        if (sort3 == 1) {
          sort = sort3 = 0;
        } else {
          sort = sort3 = 1;
        }
        break;
    }

    if (pages == true) { //拉倒底部的话页数加一
      pageNo += 1
    } else {
      pageNo = 1;
    }
    this.setData({
      no_hide: false,
      nodata: false,
      searchState: false,
      searchPage: 1,
      orderType: orderType,
      pageNo: pageNo,
      sort: sort,
      sort1: sort1,
      sort2: sort2,
      sort3: sort3,
      url: url,
      pages: false
    })
    this.format();
  },
  searchReach() { //搜索后滚动到底部翻页
    let searchPage = this.data.searchPage;
    searchPage += 1;
    this.setData({
      searchPage: searchPage
    })
    this.searchFun();
  },
  onReachBottom: function(e) { //拉到底部时调用加载数据函数
    let no_hide = this.data.no_hide;
    if (no_hide == false) {
      if (this.data.searchState) {
        this.setData({
          ReachBottom: true
        })
        this.searchReach();
      } else {
        this.setData({
          pages: true
        })
        this.tabClick(this.data.tabPosition);
      }
    }
  },
  listClick(e) {
    let idx = e.currentTarget.dataset.idx;
    let goodsId = '';
    if (this.data.list[idx].goodsId) {
      goodsId = this.data.list[idx].goodsId
    } else if (this.data.list[idx].goods_id) {
      goodsId = this.data.list[idx].goods_id
    }
    wx.navigateTo({
      url: '/pages/details/details?goodsId=' + goodsId
    })
  },
  contentClick(e) { //大家都在拼跳转拼团页面传活动ID
    let idx = e.currentTarget.dataset.idx;
    let activityId = '';
    console.log('111111111111', this.data.spellinList)
    activityId = this.data.spellinList[idx].activityId

    wx.navigateTo({
      url: '/pages/collageDetails/collageDetails?activityId=' + activityId
    })
  },
})