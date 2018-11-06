var app = getApp()
Page({
  data: {
  
  },
  onShow(){
    let parameter = {
      token: app.util.token,
    }
    app.http.post_from('member/applyForShopowner', parameter).then(res => {
      console.log(res)
      //成为店长
    }).catch(e => {
      console.log(e);
    })
  },

 

  
})