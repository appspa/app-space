<template>
  <div class="empty-app-wrapper">
    <img class="arrow" src="../../assets/empty-arrow.png" alt="">
    <div class="empty-wrapper">
      <img class="empty" src="../../assets/empty_app.png" alt="">
      <p>空空如也～～</p>
      <p>点击左上角按钮，创建第一个应用吧</p>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
    export default {
        data() {
            return {}
        },
        created() {
        },
        methods: {}
    }
</script>

<style lang="scss">
  @import "../../common/scss/base";
  .empty-app-wrapper {
    width: 100%;
    height: 100%;
    position: relative;
    .arrow {
      width: 172px;
      height: 208px;
      background-size: cover;
      display: inline-block;
      position: absolute;
      left: 50px;
    }
    .empty-wrapper {
      display: inline-block;
      width: 426px;
      height: 280px;
      position: absolute;
      left: 50%;
      margin-left: -213px;
      top: 100px;
      text-align: center;
      font-size: 0px;
      img {
        background-size: auto;
      }
      p {
        font-size: 18px;
        color: $mainColor;
        margin-top: 10px;
      }
    }
  }

</style>
