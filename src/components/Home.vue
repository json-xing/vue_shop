<template>
  <div>
    home 组件
    <el-button @click="logOut">退出</el-button>
  </div>
</template>

<script>
export default {
  methods: {
    // 退出登录
    logOut() {
      sessionStorage.clear()
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="less" scoped></style>
