// pages/addressAddOrEdit/index.js
const Toast = require('../../dist/toast/toast');
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    region: ['北京市', '北京市', '东城区'],
    addr: {
      name: '',
      defAddr: 0,
      mobile: '',
      addressDetail: '',
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getAddressList();
    if (!options.addr) {
      return;
    }

    let addr = JSON.parse(options.addr)
    this.setData({
      addr: addr,
    })
    let region = [];
    region.push(addr.provinceName);
    region.push(addr.cityName);
    region.push(addr.districtName);
    this.setData({
      region,
    })
  },
  getAddressList(provinceId) { //获取省/市列表，
    console.log(provinceId)
    let url = 'basics/anon/queryAddress'
    let params = {}
    if (provinceId) {
      params.id = provinceId
    }
    app.http.post_from(url, params).then(o => {
      if (!provinceId) { //获取省列表
        this.data.provinceList = o.data.res_data.addressList;
      } else { //获取到市列表
        this.data.cityList = o.data.res_data.addressList;
        this.getCityId();
      }
    })
  },
  getDistrictList(cityId) {//获取区县列表
    let url = 'basics/anon/queryAddress'
    let params = {
      id: cityId,
    }
    app.http.post_from(url, params).then(o => {
      this.data.districtList = o.data.res_data.addressList;
      for (var i = 0; i < this.data.districtList.length; i++) {
        if (this.data.districtList[i].addressName == this.data.region[2]) {
          this.data.districtId = this.data.districtList[i].addressId;
          console.log(this.data.districtId);
          
          break;
        }
      }
      if (!this.data.districtId) {//如果找不到选中的区，（后台数据比较旧）
        wx.showModal({
          title: '提示',
          content: '暂不支持配送到' + this.data.region[2]+',请选择其他地区',
          showCancel:false,
        })
      }else{
        this.save();
      }
    })
  },
  getProvinceId() { //获取省ID
    //听说这种写法是运行速度最快的，由于是大数据，就写麻烦一点吧
    console.log(this.data.provinceList)
    console.log(this.data.region[0])
    if (this.data.region[0]=='北京市'){
      this.data.region[0] = '北京'
    }
    for (var i = 0; i < this.data.provinceList.length; i++) {
      if (this.data.provinceList[i].addressName == this.data.region[0]) {
        this.data.provinceId = this.data.provinceList[i].addressId;
        this.getAddressList(this.data.provinceId)
        break;
      }
    }
  },
  getCityId() { //获取市ID
    for (var i = 0; i < this.data.cityList.length; i++) {
      if (this.data.cityList[i].addressName == this.data.region[1]) {
        this.data.cityId = this.data.cityList[i].addressId;
        this.getDistrictList(this.data.cityId)
        break;
      }
    }
  },
  changeValue(e) {
    console.log('地址数据', e)
    let options = {};
    this.data.addr[e.currentTarget.dataset.prop] = e.detail.value
  },
  handleCheckboxChange(e) {
    console.log(e);
    if (e.detail) {
      this.data.addr.defAddr = 1;
    }
  },
  bindRegionChange: function(e) {
    this.setData({
      postcode: e.detail.postcode,
      region: e.detail.value
    })
  },
  save() {
    var phoneReg = /(^1[3|4|5|7|8]\d{9}$)|(^09\d{8}$)/;
    if (this.data.addr.name.trim() == '') {
      wx.showModal({
        title: '提示',
        content: '请填写收件人',
        showCancel: false
      })
      return
    }
    if (this.data.addr.mobile == '' || !phoneReg.test(this.data.addr.mobile)) {
      console.log(this.data.mobile)
      wx.showModal({
        title: '提示',
        content: '请填写正确的手机号码',
        showCancel: false
      })
      return
    }
    if (this.data.addr.addressDetail.trim() == '') {
      wx.showModal({
        title: '提示',
        content: '请输入详细信息',
        showCancel: false
      })
      return
    }
    let params = {
      token: app.util.token,
      name: this.data.addr.name,
      mobile: this.data.addr.mobile,
      defAddr: this.data.addr.defAddr ? this.data.addr.defAddr : 0,
      addressDetail: this.data.addr.addressDetail,
      cityId: this.data.cityId,
      districtId: this.data.districtId,
      provinceId: this.data.provinceId,
    }
    let url = ""
    if (this.data.addr.addrId) {
      params.addrId = this.data.addr.addrId
      url = "/member/editMemAddress"
    } else {
      url = "/member/addMemAddress"
    }
    app.http.post_from(url, params).then(o => {
      if (o.data.res_code == 0) {
        Toast({
          message: o.data.res_info,
          selector: '#set_success'
        });
        wx.navigateBack({});
      } else {
        Toast({
          message: o.data.res_info,
          selector: '#set_success'
        });
      }
    }).catch(e => {
      console.log(url, e)
    })
  }
})