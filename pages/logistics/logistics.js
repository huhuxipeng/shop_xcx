var app = getApp()
Page({
  data: {},
  onLoad(options){
    console.log(options)//需要一张图片，订单ID，接口type(0：普通订单；4：砍价订单；5：拼团订单；6：金币兑换订单；7：抢购订单)
    let url,params
    if (options.rightOrderId){//如果是维权订单
      url ="/order/right/logiInfo"
      params = {
        rightOrderId: options.rightOrderId,
        token: app.util.token,
      };
    }else{
      url = 'order/LogisticsInfo'
      params = {
        orderId: options.orderId,
        token: app.util.token,
        type: options.type
      };
    }
    let that = this;
    app.http.post_from(url, params).then(res => {
      if(res.data.res_code!=0){
        wx.showModal({
          title: '提示',
          content: res.data.res_info,
          showCancel:false,
          success(){
            wx.navigateBack({
            })
          }
        })
       
        return;
      }
      let logiInfo = res.data.res_data.logiInfo;
      let list = logiInfo.list;

      for (let i = 0; i < list.length; i++) {
        let decompose1 = list[i].time.substring(0, 10);
        let decompose2 = list[i].time.substr(list[i].time.length - 8);
        list[i].decompose1 = decompose1;
        list[i].decompose2 = decompose2;
      }

      that.setData({
        logiInfo: logiInfo,
        list: list,
        face: options.face
      })
    }).catch(e => {
      console.log(e);
    })
  }
})