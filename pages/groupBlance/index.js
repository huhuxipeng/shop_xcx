let app = getApp()

Page({
  data: {
    addr: false, //是否有地址
    identity: '', //身份证
    shipAmount: 0, //邮费
    showPayAction: false,
    orderId: '',
    weix: false,
    ye: true,
    hjf: true,
    weixz: true,
    yez: false,
    show: false,
    hjfz: false,
    spellId:'',
    total: 0, //总计
  },
  selectAddress() {
    let href = '../address/index?isSelect=true'
    wx.navigateTo({
      url: href
    })
  },
  tanQuan() {
    this.setData({
      show: true,
    })
  },
  wxfu() {
    this.setData({
      weix: false,
      ye: true,
      hjf: true,
      weixz: true,
      yez: false,
      hjfz: false,
    })

  },
  yefu() {
    this.setData({
      weix: true,
      ye: false,
      hjf: true,
      weixz: false,
      yez: true,
      hjfz: false,
    })

  },
  hjffu() {
    this.setData({
      weix: true,
      ye: true,
      hjf: false,
      weixz: false,
      yez: false,
      hjfz: true,
    })

  },
  onShow() {
    console.log(this.data.addr)
    if (this.data.addr) {
      this.computeFreight();

    }
  },
  computeFreight() {
    //计算运费
    let url = "/spell/getShipAmount";
    let params = this.data.options
    params.memberAddressId = this.data.addr.addrId
    params.token = app.util.token
    app.http.post_from(url, params)
      .then(data => {
        let shipAmount = data.data.res_data.shipAmount;
        let total = shipAmount + this.data.res_data.spell.spellPrice
        this.setData({
          shipAmount: shipAmount,
          total
        })

      })
      .catch(err => {
        console.log(err);
      });
  },
  onLoad(options) {
    console.log(options);
    let token = app.util.token;
    this.setData({
      options: JSON.parse(options.options)
    })
    this.getSpellOrder();
  },
  getSpellOrder() {
    this.data.orderType = 4; //拼团商品
    let url = "/spell/getOrderCheckout";
    let params = this.data.options
    params.token = app.util.token
    app.http.post_from(url, params).then(o => {
      if(o.data.res_code!=0){
        wx.showModal({
          title: '提示',
          content: o.data.res_info,
          showCancel:false,
          success(){
            wx.navigateBack({
            })
          }
        })
        
      }
      let res_data = o.data.res_data
      let memberAddressList = res_data.memberAddressList //收货地址列表
      let shipAmount = res_data.shipAmount
      let total = shipAmount + res_data.spell.spellPrice
      let addr = false;
      if (memberAddressList) {
        memberAddressList.forEach(o => {
          if (o.defAddr) {
            addr = o;
          }
        })
      }
      this.setData({
        res_data: res_data,
        addr: addr,
        total,
        shipAmount,
      })
    }).catch(e => {
      console.log(url, e)
    })
  },
  changeValue(e) {
    let options = {};
    options[e.target.dataset.prop] = e.detail.value
  },
  paymentFun() { //立即支付
    if (!this.data.addr){
      wx.showModal({
        title: '提示',
        content: '请先选择收货地址',
        showCancel:false,
      })
      return;
    }
    this.setData({
      showPayAction: true,
    })
    console.log(this.data.orderId)
    if (this.data.orderId) { //如果已经有订单ID了
      return;
    }
    let url = '/member/jifenyuetongji'
    let params = {
      token: app.util.token
    }
    app.http.post_from(url, params).then(o => {
    
      let params = {
        token: app.util.token,
        memberAddressId: this.data.addr.addrId,
        remark: this.data.remark,
        num: this.data.res_data.spell.num,
        activityId: this.data.options.activityId,
        productId: this.data.res_data.spell.productId
      }
      let url = '/spell/createSpellOrder';//创建拼团订单
      if(this.data.options.spellId){//加入别人的拼团
        url = '/spell/participateSpell'
        params.spellId = this.data.options.spellId
      }
      app.http.post_from(url, params).then(o => {
        console.log('oooooo', o)
        if(o.data.res_code!=0){
          wx.showModal({
            title: '提示',
            content: o.data.res_info,
            showCancel:false
          })
          this.setData({
            showPayAction: false,
          })
          return;
        }
        this.setData({
          orderId: o.data.res_data.orderId,
          spellId: o.data.res_data.spellId,
        })
        let params = {
          token: app.util.token,
          orderId: this.data.orderId,
          payType: 1,
          reqType: 0
        }
        let url = '/pay/orderPay'
        app.http.post_from(url, params).then(o => {
          let obj = o.data.res_data;
          console.log('支付数据', o.data.res_data)
          this.setData({
            payOptions: obj
          })
        })
      }).catch(e => {
        console.log(url, e);
      })
    }).catch(e => {
      console.log(url, e);
    })

  }
})