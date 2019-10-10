<template>
  <div>
    <h1>这是 {{objData.page}} 的组件</h1>
    <img src="../../page2-static/page2.jpeg">
  </div>
</template>
<script>
  import data from '../../page1-static/page2.js'
  export default {
    data () {
      return {
        objData: data
      }
    }
  }
</script>
