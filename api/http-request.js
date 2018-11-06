var publish_version = false; // 是否为正式版本。
var server;
var upGradeNo = '2018072712';//版本号，
if (publish_version) { // 正式服
  server = 'https://mp.juyooo.com/'
} else { // 测试环境配置
  server = 'https://test.cheertea.com/api/'
}
function get(url, data) {
  wx.showLoading({
    title: '加载中',
  })
  return new Promise((resolve, reject) => {
    wx.request({
      url: server+ url,
      data: data,
      header: {
        // 'Content-Type': 'application/json'
      },
      success: function (res) {
        wx.hideLoading()
        resolve(res);
      },
      fail: function (res) {
        wx.hideLoading()
        reject(res);
      }
    });
  });
}


/**
 * url 请求地址
 * success 成功的回调
 * fail 失败的回调
 */
function post_from(url, data) {
  wx.showLoading({
    title: '加载中',
  })

  // console.log(data.token == '', url != 'goods/anon/goodsDetails')
  // debugger
  if (data.token == ''&& url !='goods/anon/goodsDetails'){//如果接口需要token，却没有获取到token
    wx.navigateTo({
      url: '/pages/phoneSign/phoneSign',
    })
    return new Promise((resolve, reject) => {
      wx.hideLoading()
      reject({errMsg:'wait'})
    });
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: server +url,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
      data: data,
      success: function (res) {
        wx.hideLoading()
        resolve(res);
      },
      fail: function (res) {
        wx.hideLoading()
        reject(res);
      }
    })
  });
}


/**
* url 请求地址
* success 成功的回调
* fail 失败的回调
*/
function post_json(url, data) {
  wx.showLoading({
    title: '加载中',
  })
  return new Promise((resolve, reject) => {
    wx.request({
      url: server +url,
      header: {
        dataType: 'json',
        'content-type': 'application/json;charset=UTF-8',
        // "content-type": "application/x-www-form-urlencoded"
      },
      method: 'POST',
      data: data,
      success: function (res) {
        wx.hideLoading()
        if (res.data.status == 1) resolve(res);
        else reject(res)
      },
      fail: function (res) {
        wx.hideLoading()
        reject(res);
      }
    });
  })
}
// wx.login({
//   success:function(o){
//     console.log('o',o)
//     let url = "basics/anon/appWxAuth"
//     let params = {
//       code:o.code,
//       reqType:0,
//     }
//     console.log('params',params)
//     post_json(url,params).then(a=>{
//       console.log('a',a);
//     }).catch(e=>{
//       console.log('err',e);
//     })
//   }
// })

module.exports = {
  get,
  post_from,
  post_json,
  publish_version,
  upGradeNo,
}