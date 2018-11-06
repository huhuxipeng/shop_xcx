var app = getApp()
Component({
  properties: {
    detail: {
      type: Object,
      value: {},
    }
  },
  data: {
    no_hide: false,
    list: [],
    parameter: '',
    len: true,
  },
  methods: {
    init() {
      let that = this;
      setTimeout(function() {
        that.setData({
          parameter: that.data.detail
        })
        that.format();
      })
    },
    format() {
      let that = this;
      let list = that.data.list;
      let parameter = that.data.parameter;
      let that_pageNo = that.data.parameter.pageNo;

      app.http.post_from(parameter.url, parameter).then(res => { //获取推荐列表
        let dataList = res.data.res_data.dataList;
        let len = res.data.res_data.dataList.length;

        //拿到数据，做购物车的精品推荐数据对接
        if (len > 0) {
          for (let i = 0; i < len; i++) {
            dataList[i].redPoint = that.isInteger(Math.floor(dataList[i].redPoint * 100) / 100);
            let element = res.data.res_data.dataList[i].image;
            let t = app.util.formatImg(element)
            dataList[i].image = t; //图片格式化
            list.push(dataList[i]) //赋值
            that.setData({ //赋值
              list: list
            })
          }
        } else {
          let len = this.data.len;
          that.setData({
            no_hide: true,
            len: false
          })
        }
      }).catch(e => {
        console.log(e);
      })
    },
    roll: function() { //拉到底部时调用加载数据函数
      let parameter = 'parameter.pageNo';
      let pageNo = this.data.parameter.pageNo;
      let len = this.data.len;
      if (len) {
        pageNo += 1
        this.setData({
          [parameter]: pageNo
        })
        this.format();
      }
    },
    isInteger(obj) {
      let arr = obj.toString().split('.');
      if (typeof obj === 'number' && obj % 1 === 0) {
        return obj + '.00'
      } else if (arr[1].length == 1) {
        return obj + '0'
      } else {
        return obj
      }
    },
    wrapListClick(e) {
      let idx = e.currentTarget.dataset.idx;
      let goodsId = '';
      goodsId = this.data.list[idx].goodsId

      wx.navigateTo({
        url: '/pages/details/details?goodsId=' + goodsId
      })
    }
  },
});