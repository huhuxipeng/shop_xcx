var app = getApp()
Component({
  properties: {
    detail: {
      type: Object,
      value: {},
    }
  },
  data: {

  },
  methods: {
    init(){
      let that = this;
      setTimeout(function () {
        that.setData({
          parameter: that.data.detail
        })
        that.format();
      })
    },
  },
});