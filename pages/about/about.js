var app = getApp()
Page({
  data: {
    userProtocol: false,
  },
  onLoad: function (options) {
  
  },
  userProtocolFun(){
    let userProtocol = this.data.userProtocol;
    userProtocol = !userProtocol;
    console.log(userProtocol)
    this.setData({
      userProtocol: userProtocol
    })
  },
})