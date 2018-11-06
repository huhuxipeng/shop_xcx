var app = getApp()
Page({
  data: {
  
  },
  formSubmit(e){
    console.log(e)
    let textarea = e.detail.value.textarea; 
    let qqwx = e.detail.value.qqwx; 
    let phone = e.detail.value.phone; 
    if (textarea.length<4){
      wx.showToast({
        title: '请按要求输入您的意见',
        icon: 'none',
        duration: 1200
      })
    }else{
      let that = this;
      let parameter = {
        content: textarea,
        mobile: phone,
        tencentNum: qqwx,
        token: app.util.token
      };
      app.http.post_from('member/feedback', parameter).then(res => { //获取商品分类列表
      }).catch(e => {
        console.log(e);
      })
      wx.showToast({
        title: '反馈成功',
        icon: 'none',
        duration: 1200
      })
      setTimeout(function(){
        wx.navigateTo({
          url: '/pages/about/about'
        })
      },1200)
    }
  }
})