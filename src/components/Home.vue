<template>
  <el-container>
    <el-header>
      <div>
        <img src="../assets/logo.png" alt="" />
        <span>电商后台管理系统</span>
      </div>
      <el-button @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 侧边栏菜单导航区--容器 -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          :router="true"
          :default-active="activePath"
        >
          <div @click="toggleCollapse" class="fold-button">|||</div>
          <!-- 一级菜单(可嵌套为二三级菜单) -->
          <el-submenu
            :index="item.id + ''"
            v-for="item in menuList"
            :key="item.id"
          >
            <!-- 一级菜单模板 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconObj[item.id + '']"></i>
              <!-- 标题 -->
              <span>{{ item.authName }}</span>
            </template>
            <!-- 一级菜单选项 -->
            <el-menu-item
              :index="'/' + subitem.path"
              v-for="subitem in item.children"
              :key="subitem.id"
              @click="saveNavState('/' + subitem.path)"
            >
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 标题 -->
                <span>{{ subitem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menuList: [],
      iconObj: {
        125: 'iconfont icon-users1',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      isCollapse: false,
      activePath: ''
    }
  },
  created() {
    this.getMenuList()
    // 刷新页面保持激活菜单选项高亮
    this.activePath = sessionStorage.getItem('activePath')
  },
  methods: {
    // 保存链接的激活状态
    saveNavState(activePath) {
      sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    },
    // 水平折叠菜单
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    // 退出登录
    logout() {
      sessionStorage.clear()
      localStorage.clear()
      this.$router.push('/login')
    },
    // 菜单数据获取
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status === 200) this.menuList = res.data
      // console.log(this.menuList)
    }
  }
}
</script>

<style lang="less" scoped>
.el-container {
  height: 100%;
  .el-header {
    background-color: #373d41;
    padding-left: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    div {
      display: flex;
      align-items: center;
      img {
        width: 30px;
        height: 30px;
      }
      span {
        color: white;
        margin-left: 15px;
      }
    }
  }
  .el-aside {
    background-color: #333744;
    .el-menu {
      border-right: none;
      .fold-button {
        background-color: #545c64;
        color: #fff;
        font-size: 10px;
        line-height: 23px;
        text-align: center;
        letter-spacing: 0.1em;
        cursor: pointer;
      }
    }
  }
  .el-main {
    background-color: #eaedf1;
  }

  // 图标
  .iconfont {
    margin-right: 10px;
  }
}
</style>
