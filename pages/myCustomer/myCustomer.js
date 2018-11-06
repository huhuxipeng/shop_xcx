var app = getApp()
Page({
  data: {
    follow: '未关注',
    number: 0,
  },
  onLoad() {
    let that = this;
    let parameter = {
      token: app.util.token
    };
    app.http.post_from('member/myChildMemberList', parameter).then(res => { //获取商品分类列表
      let number = that.data.number;
      let childMemberList = res.data.res_data.childMemberList;
      console.log(childMemberList)
      for (var i in childMemberList) {
        childMemberList[i].amount = app.util.strings(childMemberList[i].amount);
        childMemberList[i].redPoint = app.util.strings(childMemberList[i].redPoint);
        if (childMemberList[i].face ==''){
          childMemberList[i].face ='/static/images/default.png'
        }
        if (childMemberList[i].subscribe == 0) {
          that.setData({
            follow: '未关注',
          })
        } else if (childMemberList[i].subscribe == 1) {
          that.setData({
            follow: '已关注',
          })
        }
      }
      that.setData({
        childMemberList: childMemberList,
        number: childMemberList.length
      })
    }).catch(e => {
      console.log(e);
    })
  },
})