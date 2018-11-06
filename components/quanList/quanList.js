// components/footerBuy/index.js
var app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    detailIn:{
      type:Array,
      value:[],
      observer(o){
        o.forEach(a=>{
          a.useBeginTime = new Date(a.useBeginTime).format('yyyy.MM.dd')
          a.useEndTime = new Date(a.useEndTime).format('yyyy.MM.dd')
        })
        this.setData({
          detailIn: o
        })
      }
    },
    Wodejia:{
      type: String,
      value: ''
    },
    couponJson:{
      type:Array,
      value:[]
    },
    detailIndex:{
      type:String,
      value:''
    },
    discountPrice:{
      type: Array,
      value: []
    },
    xuanlequan:{
      type: Array,
      value: []
    },
    data: {
      type: Object,
      value: {},
      observer(o) {
        console.log('oooo', o)
        if (!o.good) {
          return
        }
        o.good.image = app.util.formatImg(o.good.image, 2);
        o.goodsSpecList.forEach(o => {
          o.detail[0].show = true;
        })
        this.setData({
          detail: o,
        })
        this.getProduct();
      }
    },
    isDuobao: {
      type: Boolean,
      value: false,
    },
    bargainId: {
      type: String,
      value: '',
    },
    show: {
      type: Boolean,
      value: false,
    },
    activityId: {
      type: String,
      value: '',
    },
    goldChangerId: {
      type: String,
      value: '',
    },
    flashsaleGoodsId: {
      type: String,
      value: '',
    },
    flashsaleId: {
      type: String,
      value: '',
    },
    spellId: {
      type: String,
      value: '',
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    detail: {},
    slot: false, //是否已告罄,
    quanList: ['1','2','3','4','5'],
    clickIndex: -1,
    select: false,
    product: '', //根据商品规格选中的产品
    stepper: { //商品数量选择器
      // 当前 stepper 数字
      stepper: 1,
      // 最小可到的数字
      min: 1,
      // 最大可到的数字
      max: 99,
      // 尺寸
      size: 'small'
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    handleZanStepperChange(o) {
      console.log('砍价数据', o.detail)
      this.setData({
        'stepper.stepper': o.detail
      });
    },
    changeGold() { //立即兑换
      let perMember = this.data.detail.exchangeCoin;
      let buyCount = this.data.stepper.stepper;
      var totolMemberCoin = buyCount * perMember;
      let obj = [{
        productId: this.data.product.productId,
        buyCount: this.data.stepper.stepper,
        goldChangerId: this.data.goldChangerId,
      }];
      let href = '../settlement/settlement?orderType=2&goodsData=' + JSON.stringify(obj)
      wx.navigateTo({
        url: href
      })
    },
    joinca() { //加入购物车
      if (!this.checkData()) {
        return;
      }
      let url = "order/addCartGoods";
      let params = {
        productId: this.data.product.productId,
        buyCount: this.data.stepper.stepper,
        token: app.util.token,
      }
      app.http.post_from(url, params).then(o => {
        console.log(o)
        if (o.statusCode == 200) {
          wx.showModal({
            title: '提示',
            content: '加入购物车成功',
            showCancel: false,
          })
          this.close();
        } else {
          wx.showModal({
            title: '提示',
            content: o.data.res_info,
            showCancel: false,
          })
        }
      }).catch(e => {
        console.log(url, e)
      })
    },
    purchase() { //立即购买
      if (!this.checkData()) {
        return;
      }
      if (this.data.activityId) { //拼团商品
        let obj = {
          productId: this.data.product.productId,
          num: this.data.stepper.stepper,
          activityId: this.data.activityId,
        }
        if (this.data.spellId) { //如果是接受邀请并且参加别人的拼团
          obj.spellId = this.data.spellId
        }
        let href = '../groupBlance/index?options=' + JSON.stringify(obj)
        wx.navigateTo({
          url: href
        })
      } else if (this.data.flashsaleId) { //限时抢购
        let obj = [{
          productId: this.data.product.productId,
          buyCount: this.data.stepper.stepper,
          flashsaleId: this.data.flashsaleId,
          cartId: ""
        }];
        let href = '../settlement/settlement?orderType=1&goodsData=' + JSON.stringify(obj)
        wx.navigateTo({
          url: href
        })
      } else if (this.data.bargainId) {//砍价商品

        let obj = [{
          productId: this.data.product.productId,
          bargainOrderId: this.data.detail.good.bargainOrderId,
        }];
        let href = '../settlement/settlement?orderType=4&goodsData=' + JSON.stringify(obj)
        wx.navigateTo({
          url: href
        })
        // let url = '/bargain/queryBargainDetail';
        // let params = {
        //   orderId: this.data.detail.good.bargainOrderId,
        //   token:app.util.token,
        // }
        // app.http.post_from(url,params).then(o=>{

        // }).catch(e=>{
        //   console.log('e')
        // })
      } else { //普通商品
        let obj = [{
          productId: this.data.product.productId,
          buyCount: this.data.stepper.stepper,
          cartId: ""
        }];
        if (this.data.activityId) {
          obj[0].activityId = this.data.activityId
        }
        let href = '../settlement/settlement?goodsData=' + JSON.stringify(obj)
        wx.navigateTo({
          url: href
        })
      }


    },
    checkData() { //购买或者加入购物车前的各种判断
      if (this.data.stepper.stepper > this.data.product.store) { //购买数大于普通商品库存
        wx.showModal({
          title: '提示',
          content: '超出库存！',
          showCancel: false,
        })
        return false;
      }
      return true;
    },
    selectSpec(e) { //选规格事件
      let index = e.target.dataset.index;
      let i = e.target.dataset.i;
      let detail = this.data.detail.goodsSpecList[index].detail.map(o => {
        o.show = false;
        return o;
      })
      let detailOption = 'detail.goodsSpecList[' + index + '].detail';
      this.setData({
        [detailOption]: detail
      })
      let option = 'detail.goodsSpecList[' + index + '].detail[' + i + '].show';
      this.setData({
        [option]: true
      })
      this.getProduct();
    },
    close() {
      this.setData({
        show: false,
      })
    },
    ling:function(e){
      
      // console.log(parseInt(this.data.Wodejia))
      // console.log(e.currentTarget.dataset['min'])



      if (parseFloat(this.data.Wodejia) >= (parseFloat(e.currentTarget.dataset['min']))){
        // console.log(this.data.detailIn)

        // this.setData({
        //   quanList: this.data.detailIn,
        // })

        let price = e.currentTarget.dataset['dis']
        let selectId = e.currentTarget.dataset['id']
        let index = e.currentTarget.dataset['index']

        this.data.discountPrice[this.data.detailIndex] = price
        this.data.xuanlequan[this.data.detailIndex] = false






        var m = 0;
        for (var i = 0; i < this.data.discountPrice.length; i++) {
          m += this.data.discountPrice[i];
        }

        // console.log(this.data.detailIndex)
        this.data.couponJson[this.data.detailIndex]['cpnId'] = selectId


        // var zizu = {
        //   'comId': this.goodsList.comList[this.INDEX].comId,
        //   'cpnId': this.selectId
        // }
        // this.couponJson[this.INDEX] = zizu;


        let pages = getCurrentPages(); //页面数组
        let prevPage = pages[pages.length - 1]; //父页面
        prevPage.setData({
          discountPrice: this.data.discountPrice,
          xuanlequan: this.data.xuanlequan,
          couponJson: this.data.couponJson,
          All: m,
          jianPrice: price
        })

        this.setData({
          clickIndex: index,
        })

        this.setData({
          show: false,
        })
      }
      else{
        wx.showModal({
          title: '提示',
          content: "本券不满足使用条件",
          showCancel: false,
        })
      }

      
    },
    getProduct() { //根据选择的规格获取对应的产品
      let specStr = ""
      let specList = this.data.detail.goodsSpecList;
      for (var i = 0; i < specList.length; i++) {
        specList[i].detail.forEach(o => {
          if (o.show) {
            specStr += o.specValueId;
            if (i != specList.length - 1) {
              specStr += ','
            }
          }

        })
      }
      let productList = this.data.detail.productList;
      let product = '';
      for (var index in productList) {
        if (specStr == productList[index].specValueIds) {
          product = productList[index];
          break;
        }
      }
      console.log(product)
      this.setData({
        product: product
      })
    }
  }
})