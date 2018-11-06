// components/detailTab/index.js
var app = getApp()
Component({

  /**
   * 页面的初始数据
   */
  data: {
    tab: {
      navList: [{
        title: '商品详情',
        id: 1
      }, {
        title: '评价',
        id: 2
      }],
      CommentList:[],
      selectedId: 1,
    },
    selectedId: 1,
    html:'',
    nodes: [{
      name: 'img',
      attrs: {
        class: 'img_class',
        style: 'width:100%;'
      },
    }]
  },
  properties: {
    intro: {
      type: String,
      value: '',
      observer(a){
        let reg = (reg = /jyimg:\//g);
        if (a) {
          let str = a.replace(
            reg,
            "https://jymall.oss-cn-beijing.aliyuncs.com/"
          );
          str = str.replace(/<img/g, '<img class="hehe" ') //防止富文本图片过大
          this.setData({
            html:str
          })
        }
      }
    },
    goodsId:{
      type:String,
      value:'3031',
      observer(a,b){
        console.log('aaa',a,b)
      }
    }
  },
  methods: {
    getCommentList() {//获取评论列表
      let detailId = this.data.goodsId;
      if (!detailId){
        detailId="3031"
      }
      let params = {
        goodsId: detailId,
        pageNo: 0,
        pageSize: 10
        }
      let url = '/goods/goodsCommentList';
      app.http.post_from(url,params).then(data => {
        let CommentList = data.data.res_data.dataList
        console.log(data)
        for (let i = 0; i <CommentList.length; i++) {
          if (CommentList[i].image == '' || CommentList[i].image == null) {
            CommentList[i].image = null

          } else {
            CommentList[i].image = CommentList[i].image.split(',')
          }
          CommentList[i].commentTime = new Date(CommentList[i].commentTime).format('yyyy-MM-dd hh:mm')
        }
        this.setData({
          CommentList:CommentList,
        })
        console.log(this.data.CommentList)
      }).catch(err => {
        console.log(err)
      })
    },
    handleTabChange(o) { //选项卡选择事件
      console.log('分类选择Id', this);
      let selectedId = o.detail;
      this.setData({
        selectedId: selectedId,
      })
      this.getCommentList()
      
    }
  },
  ready() {
  }

})