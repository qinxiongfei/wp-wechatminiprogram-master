// pages/discuss/discuss.js
var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var WxParse = require('../../wxParse/wxParse.js');
var wxApi = require('../../utils/wxApi.js')
var wxRequest = require('../../utils/wxRequest.js')
var app = getApp();
import config from '../../utils/config.js'
var pageCount = config.getPageCount;


Page({

  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    title: '文章列表',
    postsList: {},
    pagesList: {},
    categoriesList: {},
    postsShowSwiperList: {},
    isLastPage: false,
    page: 1,
    search: '',
    categories: 0,
    categoriesName: '',
    categoriesImage: "",
    showerror: "none",
    isCategoryPage: "none",
    isSearchPage: "none",
    showallDisplay: "block",
    displaySwiper: "block",
    floatDisplay: "none",
    searchKey: "",
  },

  //分享设置
  onShareAppMessage: function () {
    // var self=this;
    // self.ShowHideMenu();
    return {
      title:"分享宝宝花园的栏目：花园论坛",
      path:"pages/discuss/discuss",
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  onReachBottom: function () {

    var self = this;
    if (!self.data.isLastPage) {
      self.setData({
        page: self.data.page + 1
      });
      console.log('当前页' + self.data.page);
      this.fetchPostsData(self.data);
    }
    else {
      console.log('最后一页');
    }

  },
  reload: function (e) {
    var self = this;
    if (self.data.categories && self.data.categories != 0) {

      self.setData({
        // categories: options.categoryID,
        isCategoryPage: "block",
        showallDisplay: "none",
        showerror: "none",

      });
      self.fetchCategoriesData(self.data.categories);
    }
    if (self.data.search && self.data.search != '') {
      self.setData({
        //search: options.search,
        isSearchPage: "block",
        showallDisplay: "none",
        showerror: "none",
        searchKey: self.data.search
      })
    }
    self.fetchPostsData(self.data);
  },
  //加载分页
  loadMore: function (e) {
    var self = this;
    if (!self.data.isLastPage) {
      self.setData({
        page: self.data.page + 1
      });
      console.log('当前页' + self.data.page);
      this.fetchPostsData(self.data);
    }
    else {
      wx.showToast({
        title: '没有更多内容',
        mask: false,
        duration: 1000
      });
    }
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this;
      self.setData({
        categories: 26,
        isCategoryPage: "block"
      });
      self.fetchCategoriesData(26);
  },
  //获取文章列表数据
  fetchPostsData: function (data) {
    var self = this;
    if (!data) data = {};
    if (!data.page) data.page = 1;
    if (!data.categories) data.categories = 0;
    if (!data.search) data.search = '';
    if (data.page === 1) {
      self.setData({
        postsList: []
      });
    };

    wx.showLoading({
      title: '正在加载',
      mask: true
    });

    var getPostsRequest = wxRequest.getRequest(Api.getPosts(data));

    getPostsRequest.then(response => {

      if (response.statusCode === 200) {
        if (response.data.length < pageCount) {
          self.setData({
            isLastPage: true
          });
        };
        self.setData({
          floatDisplay: "block",
          showallDisplay: "block",
          postsList: self.data.postsList.concat(response.data.map(function (item) {
            var strdate = item.date
            if (item.category_name != null) {

              item.categoryImage = "../../images/topic.png";
            }
            else {
              item.categoryImage = "";
            }

            if (item.post_thumbnail_image == null || item.post_thumbnail_image == '') {
              item.post_thumbnail_image = '../../images/logo700.png';
            }
            item.date = util.cutstr(strdate, 10, 1);
            item.excerpt.rendered = item.excerpt.rendered.replace(/<.+?>/g, '');
            return item;
          })),

        });
        // setTimeout(function () {
        //     wx.hideLoading();

        // }, 1500);



      }
      else {
        if (response.data.code == "rest_post_invalid_page_number") {

          self.setData({
            isLastPage: true
          });

        }
        else {
          wx.showToast({
            title: response.data.message,
            duration: 1500
          })
        }
      }

    })
      .catch(function () {
        if (data.page == 1) {

          self.setData({
            showerror: "block",
            floatDisplay: "none"
          });

        }
        else {
          wx.showModal({
            title: '加载失败',
            content: '加载数据失败,请重试.',
            showCancel: false,
          });


          self.setData({
            page: data.page - 1
          });
        }

      })
      .finally(function () {
        wx.hideLoading();

      })
  },



  // 跳转至查看文章详情
  redictDetail: function (e) {
    // console.log('查看文章');
    var id = e.currentTarget.id,
      url = '../detail/detail?id=' + id;
    wx.navigateTo({
      url: url
    })
  },

  //获取分类列表
  fetchCategoriesData: function (id) {
    var self = this;
    self.setData({
      categoriesList: []
    });

    var getCategoryRequest = wxRequest.getRequest(Api.getCategoryByID(id));

    getCategoryRequest.then(response => {

      var catImage = "";
      if (typeof (response.data.category_thumbnail_image) == "undefined" || response.data.category_thumbnail_image == "") {
        catImage = "../../images/website.png";
      }
      else {
        catImage = response.data.category_thumbnail_image;
      }

      self.setData({
        categoriesList: response.data,
        categoriesImage: catImage,
        categoriesName: response.data.name
      });

      wx.setNavigationBarTitle({
        title: response.data.name,
        success: function (res) {
          // success
        }
      });

      self.fetchPostsData(self.data);

    })
  },
})