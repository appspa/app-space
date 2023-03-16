<template>
  <div class="collectionView-wrapper" >
    <ul class="collectionView-wrapper-ul">
      <li v-for="(item, index) in this.dataArr" :key="index" class="itemWrapper" >
        <div class="appItem-platform"><i :class="getPlatformClass(item)"/></div>

        <img class="appItem-icon" @error="e=>setIcon(e,item)"  :src="getIcon(item)" @click="gotoAppDetail(item)">

        <div class="appItem-info">
          <div class="appItem-info-namewrapper">
            <p class="nowrap" @click="gotoAppDetail(item)">{{item.appName}}</p>
          </div>
          <table style="width: 100%;table-layout: fixed;margin-top: 24px">
            <tr>
              <td class="appItem-info-title">短链接:</td>
              <td>
                <div class="appItem-info-appInfo nowrap" v-html="getShortUrl(item)"></div>
              </td>
            </tr>
            <tr>
              <td class="appItem-info-title">BundleId:</td>
              <td>
                <div class="appItem-info-appInfo nowrap">{{item.bundleId||'-'}}</div>
              </td>
            </tr>
<!--            <tr>-->
<!--              <td class="appItem-info-title">当前版本:</td>-->
<!--              <td>-->
<!--                <div class="appItem-info-appInfo nowrap" v-html="item.currentVersion||'-'"></div>-->
<!--              </td>-->
<!--            </tr>-->
        </table>
        </div>

        <button class="preview button-style-border" @click="clickPreviewBtn(item)">
          <i class="icon-ic_overview"></i>
          <span>预览</span>
        </button>
        <button class="editor button-style-border" @click="clickEditorBtn(item)">
          <i class="icon-ic_edit"></i>
          <span>编辑</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<script type="text/ecmascript-6">
  import rn from '../../assets/ic_rn.png'
  import android from '../../assets/ic_android.png'
  import ios from '../../assets/ic_ios.png'
  export default {
    props: {
      // 每排的间距
      minimumLineSpacing: {
        type: Number
      },
      // 每列的间距
      minimumInteritemSpacing: {
        type: Number
      },
      dataArr: {
        type: Array
      }
    },
    data() {
      return {
      }
    },
    computed: {
    },
    created() {
    },
    methods: {
      getPlatformClass(item){
        if (item.platform == 'android') {
          return 'icon-ic_andr'
        }else if (item.platform == 'ios') {
          return 'icon-ic_ios'
        }else {
          return 'icon-ic_rn'
        }
      },
      gotoAppDetail(item) {
        this.$emit('gotoAppDetail', item)
      },
      getIcon(item) {
        console.log('icon',item.icon)
        return item.icon || '';
      },
      setIcon(e,item){
        if (item.platform == 'ios') {
          e.target.src = ios
        }else if (item.platform == 'android') {
          e.target.src = android
        }else if (item.platform == 'rn') {
          e.target.src = rn
        }
      },
      getShortUrl(item) {
        return window.location.origin  + '/' + item.shortUrl;
      },
      clickEditorBtn(item) {
        this.$emit('gotoAppDetail', item)
      },
      clickPreviewBtn(item) {
        const {href} = this.$router.resolve({
          name: 'AppPreView',
          path: '/',
          params: { 'id': item.shortUrl }
        })
        window.open(href, '_blank')
      }
    }
  }
</script>

<style lang="scss">
  @import "../../common/scss/base";
  .collectionView-wrapper {
    width: 100%;
  }
  .collectionView-wrapper-ul {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
  .collectionView-wrapper .itemWrapper {
    position: relative;
    padding-bottom: 24px;
    background-color: white;
    margin-top: 20px;
    width: 264px;
    text-align: center;
    border-radius: 4px ;
    transition: 0.5s;
    margin-right: 2.6%;
    /*&:nth-child(2n-1) {*/
      /*margin-right: 2.6%;*/
    /*}*/
    /*&:nth-child(4n-2) {*/
      /*margin-right: 2.6%;*/
    /*}*/
  }
  .itemWrapper:hover {
    transform: translateY(-4px);
    box-shadow: 0 15px 30px rgba(0,0,0,.1);
  }
  .itemWrapper:hover .appItem-info-namewrapper p {
    color: #000;
  }
  .collectionView-wrapper .itemWrapper .appItem-platform{
    position: absolute;
    left: -2px;
    top: 14px;
    width: 45px;
    height: 32px;
    border-top-right-radius: 19px;
    border-bottom-right-radius: 19px;
    background-color: #35394b;
    i:before{
      line-height: 32px;
      font-size: 22px;
      margin: auto 0px;
      color: #fff;
    }
  }

  .itemWrapper .appItem-icon {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    margin-top: 24px;
    cursor: pointer;
  }
  .itemWrapper .appItem-info {
    margin-top: 24px;
    overflow: hidden;
  }
  .appItem-info-namewrapper p {
    font-size: 18px;
    cursor: pointer;
    display: inline-block;
    color: $mainTitleColor;
    font-family: "PingFang SC";
    vertical-align: top;
  }
  .appItem-info-namewrapper p:hover{
    color: #000;
  }
  .appItem-info-title {
    font-size: 10px;
    color: #999;
    text-align: right;
    padding-right: 10px;
    width: 30%;
    height: 25px;
  }
  .appItem-info-appInfo {
    font-size: 10px;
    color: #333;
    max-width: 100%;
    line-height: 25px;
    text-align: left;
  }
  .collectionView-wrapper-ul .itemWrapper button {
    width: 36px;
    height: 36px;
    margin-top: 36px;
    float: right;
    border-color: #ccc;
    position: relative;
    overflow: hidden;
  }
  .collectionView-wrapper-ul .itemWrapper button i:before {
    color: #aaa;
  }
  .collectionView-wrapper-ul .itemWrapper button span {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    line-height: 36px;
    background-color: white;
    opacity: 0;
  }
  .collectionView-wrapper-ul .itemWrapper button:hover {
    border-color: $mainColor;
  }
  .collectionView-wrapper-ul .itemWrapper button span:hover {
    opacity: 1;
  }
  .collectionView-wrapper-ul .itemWrapper .editor {
    margin-right: 12px;
  }
  .collectionView-wrapper-ul .itemWrapper .preview {
    margin-right: 24px;
  }
  /*@media screen and (max-width: 840px) {*/
    /*.collectionView-wrapper .itemWrapper {*/
      /*width: 220px;*/
    /*}*/
  /*}*/
  /*@media screen and (max-width: 760px) {*/
    /*.collectionView-wrapper .itemWrapper {*/
      /*width: 240px;*/
    /*}*/
  /*}*/
</style>
