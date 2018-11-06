import http from './http-request.js'
//获取系统信息
function getSystemInfo() {
  return new Promise((resolve, reject) => {
    wx.getSystemInfo({
      success: res => {
        resolve(res)
      },
      fail: err => {
        reject(err)
      }
    })
  })
}

function formatImg(imgs, ws) { //imgs地址，w 1全屏 2半屏 3三分之一屏
  if (!imgs) {
    return '/static/images/default.png'
  }
  let reg = new RegExp('jyimg:/');
  let urls = '';
  var widths = wx.getSystemInfoSync().windowWidth
  if (ws == 1 || !ws) {
    ws = 1.05
  }
  var w = parseInt(widths / ws) + 100;
  //防止重复格式化图片
  if (imgs.indexOf('x-oss-process=image/resize,w_494') != -1) {
    return imgs;
  }
  if (reg.test(imgs)) {
    let reg = new RegExp('jyimg:/');
    let imgurl = '';
    if (!http.publish_version) { //测试服
      imgurl = imgs.replace(reg, 'https://jymall-test.oss-cn-beijing.aliyuncs.com/')
    } else if (http.publish_version) { //正式服
      imgurl = imgs.replace(reg, 'https://jymall.oss-cn-beijing.aliyuncs.com/')
    }
    urls = imgurl + '?x-oss-process=image/resize,w_' + w
  } else {
    urls = imgs + '?x-oss-process=image/resize,w_' + w
  }
  return urls
}
var token = ''; //开发用token
// var token = 'uIShEVkGVrTYNUWHRmck1Q==';//开发用token
// var token = 'oPFMGBNMYChfMIJltBSSXg=='; //开发用token
// wx.setStorageSync('token','');//清除缓存的token，强制重新登录
if(wx.getStorageSync('token')){
  token = wx.getStorageSync('token')
  userInfo = JSON.parse(wx.getStorageSync('userInfo'))
}
let strings = function(str) {
  if (typeof(str) == 'number') {
    str = JSON.stringify(str)
  }
  let indexs = str.indexOf('.')
  let strs = str.toString().split('.');
  if (indexs > 0) {
    if (strs[1].length == 1) {
      str = str + '0'
    } else if (strs[1].length > 1 || strs[1] == "00") {
      str = str.slice(0, indexs + 3)
    }
  } else {
    str = str + '.00'
  }
  return str
}
let check = function(str, type) {
  if (!type) { //默认验证手机号
    type = "phone"
  }
  switch (type) {
    case 'phone':
      if (!str || str.length == 0) {
        wx.showModal({
          title: '提示',
          content: '请输入手机号码',
          showCancel: false,
          success: function(res) {}
        })
        return false;
      }
      if (str.length != 11) {
        wx.showModal({
          title: '提示',
          content: '请输入有效的手机号码！',
          showCancel: false,
          success: function(res) {}
        })
        return false;
      }

      var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}|(19[0-9]{1})))+\d{8})$/;
      if (!myreg.test(str)) {
        wx.showModal({
          title: '提示',
          content: '请输入有效的手机号码！',
          showCancel: false,
          success: function(res) {}
        })
        return false;
      }
      return true;

  }
}
Date.prototype.format = function(fmt) {
  var o = {
    "M+": this.getMonth() + 1, //月份
    "d+": this.getDate(), //日
    "h+": this.getHours(), //小时
    "m+": this.getMinutes(), //分
    "s+": this.getSeconds(), //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    "S": this.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    }
  }
  return fmt;
}

function share(title, options) {
  var pages = getCurrentPages();
  let path = pages[pages.length - 1].route;
  let url = "?"
  if (!options) {
    options = pages[pages.length - 1].options
  }
  options.isInvite = true;
  let memberId = JSON.parse(wx.getStorageSync('userInfo'))
  options.memberId = memberId.memberId;
  for (var i in options) {
    url = url + i + '=' + options[i] + '&'
  }

  path += url;
  path = path.substring(0, path.length - 1)
  // token = '';
  return {
    title: title,
    path: path //页面路径
  }
}

function formatTime(date) { //日历
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}
let userInfo = undefined;
function formatCpnType(cpnType) { //格式化优惠券类型
  switch (cpnType) {
    case 0:
      return '分类券';
      break;
    case 1:
      return '商品券'
      break;
    case 2:
      return '店铺';
      break;
    case 3:
      return '全场'
      break;
  }
}

function showRelDetail(val) {
  console.log('专题参数',val)
  if (typeof(val.relType) == 'string') {
    val.relType = parseInt(val.relType)
  }
  switch (val.relType) {
    //2001外链
    case 2001:
      // wx.navigateTo({
      //   url: 'https://wx.juyooo.com/bobing/#/roomlist'
      // })
      let url = 'https://wx.juyooo.com/bobing/#/roomlist'
      console.log('url', url)
      wx.navigateTo({
        url: '/pages/webview/index?src=' + url
      });
      break;
      //  2002商品
    case 2002:
      if (val.relId != null) { //查看商品详情
        wx.navigateTo({
          url: '/pages/details/details?goodsId=' + val.relId
        })
      } else { //商品列表好像
        // wx.navigateTo({
        //   url: '/pages/special/special'
        // })
      }
      break;
      //2003店铺
    case 2003:


      break;
      // 2004专题
    case 2004:
      // if (val.relId) {
      //   this.$router.push({
      //     path: "/specials",
      //     query: { relId: val.relId }
      //   });
      // }
      if (val.relHref != '') {
        wx.navigateTo({
          url: '/pages/special/special?relId=' + val.relId
        })
      }
      break;
      //  2005分类
    case 2005:
      if (val.relId) {
        console.log(1111)
        wx.switchTab({
          url: '/pages/classification/classification?relId=' + val.relId
        })
      } else {
        console.log(2222)
        wx.switchTab({
          url: 'pages/search/search',
        })
      }
      break;
      // 2006签到
    case 2006:
      // this.$router.push({ path: "/myGold" });
      wx.navigateTo({
        url: '/pages/qianDao/qianDao',
      })
      break;
      //  2007普通团
    case 2007:
      if (val.relId != null) {
        wx.navigateTo({
          url: '../../pages/collageDetails/collageDetails?activityId=' + val.relId,
        })
      } else {
        wx.navigateTo({
          url: '../../pages/collage/collage',
        })
      }

      break;
      //  2008砍价
    case 2008:
      // this.$router.push({
      //   path: "/bargain/bargainshop",
      //   query: { state: 0 }
      // });

      wx.navigateTo({
        url: '/pages/cutprice/cutprice?state=' + 0
      })
      break;
      //  2009店长福利
    case 2009:
      // if (sessionStorage.identityId == 1) {
      //   this.$router.push("/commodity");
      // } else {
      //   identyPath();
      // }
      let identityId = 1;
      if (identityId == 1) { //店长
        wx.navigateTo({
          url: '/pages/myGoods/myGoods'
        })
      } else { //非店长
        wx.navigateTo({
          url: '/pages/giftList/giftList'
        })
      }
      break;
      //  2010多抱团
    case 2010:
      // this.$router.push({ path: "/seize/seizeIndex", query: {} });
      console.log(val)
      if (val.relId) {
        wx.navigateTo({
          url: '/pages/treasureDetails/treasureDetails?activityId=' + val.relId,
        })
        return
      }
      wx.navigateTo({
        url: '/pages/treasure/treasure'
      })
      break;
      //  2011兑换中心
    case 2011:
      // if (val.relId) {
      //   this.$router.push({
      //     path: "/goods/detail",
      //     query: { goldChangerId: val.relId }
      //   });
      // } else {
      //   this.$router.push({ path: "/goldChanger" });
      // }
      if (val.relId) {
        wx.navigateTo({
          url: '/pages/details/details?goldChangerId=' + val.relId
        })
      } else {
        wx.navigateTo({
          url: '/pages/goldExchange/goldExchange',
        })
      }

      break;
      //  2012折扣
    case 2012:
      // this.$router.push();
      break;
      //  2013限时购
    case 2013:
      // this.$router.push({ path: "/flashSale" });
      wx.navigateTo({
        url: '/pages/timeLimit/timeLimit'
      })
      break;
      //兑换记录
    case 2014:
      // this.$router.push({
      //   path: "/order/list",
      //   query: { isGoldChanger: true }
      // });

      wx.navigateTo({
        url: '/pages/goldOrderList/index?isGoldChanger=' + true
      })
      break;
    case 2015: //现金券
      console.log('现金券')
      let pages = getCurrentPages(); //页面数组
      let prevPage = pages[pages.length - 1]; //父页面
      let href = '/coupon/anon/queryCouponDetail';
      let params = {
        cpnId: val.relId
      }
      http.post_from(href, params).then(o => {
        let pickCouponList = [];
        let coupon = o.data.res_data.coupon
        coupon.getBeginTime = new Date(coupon.getBeginTime).format('MM.dd');
        coupon.getEndTime = new Date(coupon.getEndTime).format('MM.dd');
        pickCouponList.push(coupon)
        console.log('pickCouponList', pickCouponList)
        prevPage.setData({
          pickCouponList: pickCouponList,
          showCouponDetail: true,
        })
      }).catch(e => {
        console.log(e)
      })
      break;
  }
}

module.exports = {
  formatImg,
  token,
  getSystemInfo,
  strings,
  check,
  share,
  userInfo,
  formatCpnType,
  showRelDetail,
  formatTime
}