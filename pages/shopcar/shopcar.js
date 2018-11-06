var app = getApp()
Page({
  data: {
    token: '',
    parameter:{ //购物车精品推荐-组件参数
      url: 'goods/anon/recommendedGoods',
      pageNo: 1,
      pageSize: 10,
      typeCode: 3002,
    },
    cartUrl: 'order/pageCart',
    no_hide: false,
    empty: false,
    shops: [],
    settlement: 0, //结算
    totalPrice: 0, // 总价，初始为0
    selectAllStatus: true, // 全选状态，默认全选
    sum: 0,
    goodsdata: []
  },
  onShow() {
    this.cartUrl();
  },
  editCartOfBuyCount(shopId, index, carts) {
    // console.log(carts)
    let parameter = {
      token: app.util.token,
      buyCount: carts,
      productId: this.data.shops[shopId].carts[index].productId
    }
    app.http.post_from('order/editCartOfBuyCount', parameter).then(res => {
      // console.log('成功加', res)
    })
  },
  addFun(e) {
    let [shopId, index] = [e.currentTarget.dataset.shop, e.currentTarget.dataset.index];
    // let shopId = e.currentTarget.dataset.shop;
    // let index = e.currentTarget.dataset.index;
    let carts = this.data.shops[shopId].carts[index].num;
    let carts2 = 'shops[' + shopId + '].carts[' + index + '].num';
    let num = carts;
    num = num + 1;
    carts = num;
    this.setData({
      [carts2]: carts
    });
    this.editCartOfBuyCount(shopId, index, carts);
    this.getTotalPrice();
  },
  reduceFun(e) {
    let shopId = e.currentTarget.dataset.shop;
    let index = e.currentTarget.dataset.index;
    let carts = this.data.shops[shopId].carts[index].num;
    let carts2 = 'shops[' + shopId + '].carts[' + index + '].num';
    let num = carts;
    if (num <= 1) {
      return false;
    }
    num = num - 1;
    carts = num;
    this.setData({
      [carts2]: carts
    });
    this.editCartOfBuyCount(shopId, index, carts);
    this.getTotalPrice();
  },
  blurFn: function (e) {
    const shopId = e.currentTarget.dataset.shop;
    const index = e.currentTarget.dataset.index;
    var text = parseInt(e.detail.value);
    if (!text) {
      text = ''
    }
    let carts2 = 'shops[' + shopId + '].carts[' + index + '].num';
    this.setData({
      [carts2]: text
    });
    this.editCartOfBuyCount(shopId, index, text);
    this.getTotalPrice();
  },
  bindblurFun(e){
    if (e.detail.value == '') {
      const shopId = e.currentTarget.dataset.shop;
      const index = e.currentTarget.dataset.index;
      let carts2 = 'shops[' + shopId + '].carts[' + index + '].num';
      this.setData({
        [carts2]: 1
      });
      this.editCartOfBuyCount(shopId, index, 1);
      this.getTotalPrice();
    }
  },
  cartUrl(){
    let that = this;
    let shops = that.data.shops;
    let parameter = {
      token: app.util.token,
      pageNo: 0,
      pageSize: 0
    }
    shops.length = 0;
    app.http.post_from(that.data.cartUrl, parameter).then(res => { //获取购物车列表
      var dataList = res.data.res_data.dataList;
      var len = dataList.length;

      if (len != 0) { //如果购物车有数据，结算块显示
        that.setData({
          empty: false,
          selectAllStatus: true,
        })
      } else {
        that.setData({
          empty: true
        })
        //获取精品推荐组件id
        let tempList = this.selectComponent("#tempList");
        tempList.init();
      }
      for (var i = 0; i < len; i++) {
        let len2 = dataList[i].goodsList.length;
        shops.push({
          shopSele: true,
          shopcarBox: true, //店铺区域是否有数据
          shopName: '手机专卖店',
          'carts': [],
        })

        shops[i].shopName = dataList[i].comName;  //店铺名称
        for (var j = 0; j < len2; j++) {
          shops[i].carts.push({
            hasList: true, // 列表是否有数据
            deleteData: false,
            id: 1,
            shopId: 0,  //区分不同店铺的关键
            title: '',
            taste: '',
            image: '',
            num: 0,
            price: 0,
            mktprice: 0,
            selected: true,
          })
          dataList[i].goodsList[j].price = app.util.strings(dataList[i].goodsList[j].price);
          dataList[i].goodsList[j].mktprice = app.util.strings(dataList[i].goodsList[j].mktprice);
          var element = dataList[i].goodsList[j].image;
          let t = app.util.formatImg(element)
          dataList[i].goodsList[j].image = t;//图片格式化
          shops[i].carts[j].title = dataList[i].goodsList[j].name;  //商品名称
          shops[i].carts[j].price = dataList[i].goodsList[j].price;
          shops[i].carts[j].mktprice = dataList[i].goodsList[j].mktprice;
          shops[i].carts[j].taste = dataList[i].goodsList[j].specs;
          shops[i].carts[j].num = dataList[i].goodsList[j].buyCount;
          shops[i].carts[j].image = dataList[i].goodsList[j].image;
          shops[i].carts[j].goodsId = dataList[i].goodsList[j].goodsId;
          shops[i].carts[j].cartId = dataList[i].goodsList[j].cartId;
          shops[i].carts[j].productId = dataList[i].goodsList[j].productId;
          shops[i].carts[j].shopId = i;

        }
      }

      that.setData({
        shops: shops
      })
      that.getTotalPrice(); //计算总价
    }).catch(e => {
      console.log(e);
    })  
  },
  settlementFun(){
    let shops = this.data.shops;
    let goodsdata = this.data.goodsdata;
    let shopcarsele = false;
    goodsdata.length = 0;
    
    for (let i = 0; i < shops.length;i++){
      let len2 = shops[i].carts.length;
      for (let j = 0; j < len2; j++) {
        let obj = {};
        if (shops[i].carts[j].selected){
          shopcarsele=true;
          obj.cartId = shops[i].carts[j].cartId;
          obj.productId = shops[i].carts[j].productId;
          obj.buyCount = shops[i].carts[j].num;
          goodsdata.push(obj)
        }
      }
    }
    if (shopcarsele){
      wx.navigateTo({
        url: '/pages/settlement/settlement?goodsData=' + JSON.stringify(goodsdata)
      })
    }
  },
  jumpFun(e){//跳转带上商品ID
    let shopIdx = e.currentTarget.dataset.index;  //店铺下标
    let idx = e.currentTarget.dataset.idx;  //商品的下标
    let goodsId = this.data.shops[shopIdx].carts[idx].goodsId;
    wx.navigateTo({
      url: '/pages/details/details?goodsId=' + goodsId
    })
  },
  onReachBottom: function (e) { //拉到底部时调用加载数据函数
    let that = this;
    let shops = that.data.shops;
    if (shops == '') {
      let tempList = that.selectComponent("#tempList");
      tempList.roll();
    }
  },
  /**
   * 计算总价
   */
  getTotalPrice(shopId, index) {
    let shops = this.data.shops; // 获取购物车列表
    let total = 0;
    let theSum = 0;
    let delNum = 0; //删除的数量
    let shopcarBox = 'shops[' + shopId + '].shopcarBox';
    if (shopId != undefined) {
      let deldata = 'shops[' + shopId + '].carts[' + index + '].selected';
      let num = 'shops[' + shopId + '].carts[' + index + '].num';
      this.setData({
        [deldata]: false, //carts中的selected
        [num]: 0, //单件商品的数量
      })
      //删除
      for (let i = 0; i < shops.length; i++) {
        for (let j = 0; j < shops[shopId].carts.length; j++) {
          if (shops[shopId].carts[j].num == 0) {
            delNum++; //删除一个加1
          } else {
            delNum = -1000;
          }
        }
      }
      if (delNum > 0) {
        //如果单个店铺没有数据了删除店铺区块
        this.setData({
          [shopcarBox]: false
        })
      }
      //删除
      //删除商品后全选状态
      let carts = this.data.shops[shopId].carts;
      let shopState = 'shops[' + shopId + '].shopSele';
      let sum = this.data.sum;
      let seles = 0;
      for (let i = 0; i < carts.length; i++) {
        if (shops[shopId].carts[i].selected == true) {
          sum++;
        } else {
          sum--;
        }
      }
      for (let i = 0; i < carts.length; i++) {
        if (shops[shopId].carts[i].num != 0) {
          seles++;
        } else {
          seles--;
        }
      }
      if (sum >= seles) { //删除时如果选中数量等于被删除数量全选为TRUE
        this.setData({
          [shopState]: true,
          selectAllStatus: true,
        });
      }
      //删除商品后全选状态
    }
    //正常运算
    for (let i = 0; i < shops.length; i++) { // 循环列表得到每个数据
      for (let j = 0; j < shops[i].carts.length; j++) { // 循环列表得到每个数据
        if (shops[i].carts[j].selected == true) { // 判断选中才会计算价格
          total += shops[i].carts[j].num * shops[i].carts[j].price; // 所有价格加起来
          theSum++;
        }
      }
    }
    arr = arr.map(o=>{
      o.active = true;
      o.list = o.list.map(a=>{
        a.class='active'
        return a;
      })
      return o
    })
    total = app.util.strings(total);
    this.setData({
      sum: 0,
      settlement: theSum,
      totalPrice: total
    });
    if (theSum == 0) {
      //没有数据全选状态取消
      
      this.setData({
        selectAllStatus: false,
      });
    }
    //正常运算
  },
  // 选中店铺
  shopsList(e) {
    const index = e.currentTarget.dataset.index;
    let shops = this.data.shops;
    const selected = shops[index].shopSele;
    shops[index].shopSele = !selected;
    for (let i = 0; i < shops[index].carts.length; i++) {
      let cartsSele = 'shops[' + index + '].carts[' + i + '].selected';
      let hasList = shops[index].carts[i].hasList;
      if (hasList) {
        this.setData({
          [cartsSele]: shops[index].shopSele
        })
      }
    }
    this.setData({
      shops: shops,
    })
    //单选店铺时判断全选状态
    var sum = this.data.sum;
    for (let i = 0; i < shops.length; i++) {
      if (shops[i].shopSele == true) {
        sum++;
      } else {
        sum = -1000
      }
    }
    if (sum >= shops.length) {
      this.setData({
        selectAllStatus: true,
      });
    } else {
      this.setData({
        selectAllStatus: false,
      });
    }
    this.getTotalPrice();
  },
  /**
   * 当前商品选中事件
   */
  selectList(e) {
    const index = e.currentTarget.dataset.index; // 获取data- 传进来的index
    const shopIdx = e.currentTarget.dataset.shop; // 获取data- 传进来的index
    let shops = this.data.shops;
    let carts = this.data.shops[shopIdx].carts; // 获取购物车列表
    const selected = carts[index].selected; // 获取当前商品的选中状态
    carts.selected = !selected; // 改变状态
    var shopState = 'shops[' + shopIdx + '].shopSele';
    var carts2 = 'shops[' + shopIdx + '].carts[' + index + '].selected';
    this.setData({
      [carts2]: carts.selected
    });
    //单选时判断全选状态
    var sum = this.data.sum;
    var seles = 0;
    for (let i = 0; i < carts.length; i++) {
      if (shops[shopIdx].carts[i].selected == true) {
        sum++;
      } else {
        sum--;
      }
    }
    for (let i = 0; i < carts.length; i++) {
      if (shops[shopIdx].carts[i].num != 0) {
        seles++;
      } else {
        seles--;
      }
    }
    if (sum >= seles) {
      this.setData({
        [shopState]: true
      });
    } else {
      this.setData({
        [shopState]: false
      });
    }
    //单选店铺时判断全选状态
    for (let i = 0; i < shops.length; i++) {
      if (shops[i].shopSele == true) {
        sum++;
      } else {
        sum = -1000
      }
    }
    if (sum >= shops.length) {
      this.setData({
        selectAllStatus: true,
      });
    } else {
      this.setData({
        selectAllStatus: false,
      });
    }
    this.getTotalPrice(); // 重新获取总价
  },
  /**
   * 购物车全选事件
   */
  selectAll(e) {
    let selectAllStatus = this.data.selectAllStatus; // 是否全选状态
    selectAllStatus = !selectAllStatus;
    let shops = this.data.shops;
    for (let i = 0; i < shops.length; i++) {
      shops[i].shopSele = selectAllStatus; // 改变所有商品状态
      for (let k = 0; k < shops[i].carts.length; k++) {
        if (shops[i].carts[k].hasList == true) {
          shops[i].carts[k].selected = selectAllStatus; // 改变所有商品状态
        }
      }
    }

    this.setData({
      selectAllStatus: selectAllStatus,
      shops: shops,
    });
    this.getTotalPrice(); // 重新获取总价
  },
  //手指触摸动作开始 记录起点X坐标
  touchstart: function(e) {
    //开始触摸时 重置所有删除
    // this.data.items.forEach(function (v, i) {
    //     if (v.isTouchMove)//只操作为true的
    //         v.isTouchMove = false;
    // })
    this.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
    })
  },
  //滑动事件处理
  touchmove: function(e) {
    var that = this,
      index = e.currentTarget.dataset.index, //当前索引
      shopId = e.currentTarget.dataset.shop, //当前索引
      startX = that.data.startX, //开始X坐标
      startY = that.data.startY, //开始Y坐标
      touchMoveX = e.changedTouches[0].clientX, //滑动变化坐标
      touchMoveY = e.changedTouches[0].clientY, //滑动变化坐标
      //获取滑动角度
      angle = that.angle({
        X: startX,
        Y: startY
      }, {
        X: touchMoveX,
        Y: touchMoveY
      });
    let shops = 'shops[' + shopId + '].carts[' + index + '].deleteData';

    //滑动超过30度角 return
    if (Math.abs(angle) > 30) {
      return;
    }
    if (touchMoveX > startX) {
      //右滑
      that.setData({
        [shops]: false
      })
    } else {
      //左滑
      that.setData({
        [shops]: true
      })
    }
  },
  /**
   * 计算滑动角度
   * @param {Object} start 起点坐标
   * @param {Object} end 终点坐标
   */
  angle: function(start, end) {
    var _X = end.X - start.X,
      _Y = end.Y - start.Y
    //返回角度 /Math.atan()返回数字的反正切值
    return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
  },
  //删除事件
  del: function(e) {
    let that = this;
    let index = e.currentTarget.dataset.index; //当前索引
    let shopId = e.currentTarget.dataset.shop; //店铺索引
    let shops_carts = 'shops[' + shopId + '].carts';
    let shops = 'shops[' + shopId + '].carts[' + index + '].hasList';

    let cartId = that.data.shops[shopId].carts[index].cartId;
    let parameter = {
      cartIds: cartId,
      token: app.util.token,
    }
    app.http.post_from('order/delCartGoods', parameter).then(res => { //删除购物车物品
      that.cartUrl();
    }).catch(e => {
      console.log(e);
    })
  },
})