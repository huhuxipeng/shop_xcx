
var app = getApp()
Component({
  properties: {
    detail: {
      type: Object,
      value: {}
    }
  },
  methods: {
    showDetail(e){
      console.log(e.target.dataset.rel)
      let val = e.target.dataset.rel
      app.util.showRelDetail(val)
    },
    onTap: function(){
      console.log('hhhh',this.data.item)

    }
  },
});
