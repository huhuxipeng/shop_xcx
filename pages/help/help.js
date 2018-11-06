var app = getApp()
Page({
  data: {
    sele: 0,
    helpTypeId: 7,
    helpList:[]
  },
  onLoad: function (options) {
    this.requestFun();
  },
  seleClick(e){
    let that = this;
    let helpTypeId = that.data.helpTypeId;
    let idx = e.target.dataset.idx;
    if(idx==0){
      helpTypeId = 7;
    } else if (idx == 1) {
      helpTypeId = 4;
    } else if (idx == 2) {
      helpTypeId = 5;
    } else if (idx == 3) {
      helpTypeId = 6;
    }
    that.setData({
      sele: idx,
      helpTypeId: helpTypeId
    })
    that.requestFun();
  },
  requestFun(){
    let that = this;
    let parameter = {
      helpTypeId: that.data.helpTypeId,
      pageNo: 0,
      pageSize: 0
    };
    app.http.post_from('/basics/anon/getHelpPage', parameter).then(res => { //获取商品分类列表
      let helpList = res.data.res_data.helpList;
      that.setData({
        helpList: helpList
      })
    }).catch(e => {
      console.log(e);
    })
  }
})