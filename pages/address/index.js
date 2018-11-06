// pages/address/index.js
const Toast = require('../../dist/toast/toast');
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    memberAddressList: [],
    bank:false,
    isSelect: false, //判断是否是结算页面过来选择地址的
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function() {
    this.getAddressList();
    // console.log('isSelect', this.data.isSelect)
  },
  onLoad(options) {
    // console.log(options)
    if (options.isSelect) {
      this.setData({
        isSelect: true,
      })
    }
  },
  selectAddr(o) { //选中地址
    let index = o.target.dataset.index;
    let addr = this.data.memberAddressList[index];
    // console.log(addr)
    let pages = getCurrentPages(); //页面数组
    let prevPage = pages[pages.length - 2]; //上一页面
    prevPage.setData({ //直接给上移页面赋值
      addr: addr,
      selAddress: 'yes'
    });
    wx.navigateBack();
  },
  delAddress(e) {
    let that = this;
    var getaddr = wx.getStorageSync('addr');
    wx.showModal({
      title: '提示',
      content: '确定要删除该地址吗？',
      showCancel: true,
      success: function(res) {
        let index = e.target.dataset.index;
        let addrId = that.data.memberAddressList[index].addrId
        if(res.confirm){
          let params = {
            addrId: addrId,
            token: app.util.token
          }
          let url = "/member/delMemAddress"
          app.http.post_from(url, params).then(o => {
            Toast({
              message: '删除成功',
              selector: '#set_success'
            });
            that.onShow()
            if (getaddr.addrId == addrId){//删除地址后清除店长支付中选中的地址
              wx.removeStorageSync('addr')
            }


          }).catch(e => {
            console.log(url, e)
          })
        }
      }
    })

  },
  addAddress() {
    let href = '../addressAddOrEdit/index'
    wx.navigateTo({
      url: href
    })
  },
  editAddress(e) {
    let index = e.target.dataset.index;
    if (index == undefined) {
      return;
    }
    let addr = this.data.memberAddressList[index]
    let href = '../addressAddOrEdit/index?addr=' + JSON.stringify(addr)
    wx.navigateTo({
      url: href
    })
  },

  getAddressList() {
    let url = "/member/queryMemAddressList";
    let params = {
      token: app.util.token
    }
    app.http.post_from(url, params).then(o => {
      this.setData({
        memberAddressList: o.data.res_data.memberAddressList
      })
    }).catch(e => {
      console.log(url, e)
    })
  },
  handleCheckboxChange(o) {
    // console.log(o);
    let index = o.target.dataset.index;
    let memberAddressList = this.data.memberAddressList.map(o => {
      o.defAddr = 0;
      return o;
    })
    this.setData({
      memberAddressList,
    })
    let option = 'memberAddressList[' + index + '].defAddr'
    this.setData({
      ['option']: 1
    })
    if (!o.detail) {
      return;
    }

    let addrId = this.data.memberAddressList[index].addrId;
    let url = "/member/editDefAddr";
    let params = {
      addrId: addrId,
      token: app.util.token
    }
    app.http.post_from(url, params).then(o => {
      Toast({
        message: '设置成功',
        selector: '#set_success'
      });
    }).catch(e => {
      console.log(url, e)
    })
  }
})