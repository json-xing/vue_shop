<template>
  <div class="roles">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col><el-button type="primary">添加角色</el-button></el-col>
      </el-row>
      <!-- 角色列表区 -->
      <el-table :data="roleList" border stripe>
        <!-- 扩展区 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', i1 == 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="i1"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="4">
                <el-tag
                  closable
                  @close="removeRightById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二三级权限 -->
              <el-col :span="20">
                <!-- 渲染二级权限 -->
                <el-row
                  :class="[i2 !== 0 ? 'bdtop' : '', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="i2"
                >
                  <el-col :span="6"
                    ><el-tag
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                      type="success"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 渲染三级权限 -->
                    <el-tag
                      type="warning"
                      v-for="(item3, i3) in item2.children"
                      :key="i3"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                      >{{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 序号列 -->
        <el-table-column label="序号" type="index"> </el-table-column>
        <!-- 角色名称列 -->
        <el-table-column label="角色名称" prop="roleName" min-width="100">
        </el-table-column>
        <!-- 角色描述列 -->
        <el-table-column label="角色描述" prop="roleDesc" min-width="100">
        </el-table-column>
        <!-- 操作列 -->
        <el-table-column label="操作" width="300">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini">
              编辑
            </el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini">
              删除
            </el-button>
            <!-- 分配权限按钮 -->
            <el-button
              @click="showSetRightDialog(scope.row)"
              type="warning"
              icon="el-icon-setting"
              size="mini"
            >
              分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
    >
      <!-- 树形结构权限列表 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        default-expand-all
        node-key="id"
        :default-checked-keys="defkeys"
        ref="treeRefs"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRight()">
          确 定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      roleList: [],
      // 控制分配权限对话框显示
      setRightDialogVisible: false,
      // 权限列表
      rightsList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 保存选中权限id
      defkeys: [],
      // 保存当前角色Id
      roleId: ''
    }
  },
  created() {
    this.getRoleList()
  },
  methods: {
    // 分配权限
    async setRight() {
      const keys = [
        ...this.$refs.treeRefs.getCheckedKeys(),
        ...this.$refs.treeRefs.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      // console.log(keysStr)
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限出错,请重试!')
      }
      // 刷新角色列表(呈现最新的权限分配状况)
      this.getRoleList()
      this.$message.success('权限分配成功!')
      this.setRightDialogVisible = false
    },
    // 通过递归函数获得所有已选中权限
    getLeafKeys(node, arr) {
      // console.log(node)
      if (!node.children) return arr.push(node.id)
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 展示分配权限对话框
    async showSetRightDialog(role) {
      // 保存roleId,供发起角色授权请求使用
      this.roleId = role.id
      // 获取所有权限列表
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$$message.err('获取权限列表出错')
      this.rightsList = res.data
      // 调用获取所有已选中权限的递归函数(注意调用前清空defkeys数组)
      this.defkeys = []
      this.getLeafKeys(role, this.defkeys)
      // 打开分配权限对话框
      this.setRightDialogVisible = true
    },
    // 删除权限
    async removeRightById(role, id2) {
      const res1 = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 点击确认按钮
      if (res1 !== 'confirm') return this.$message.info('取消了删除!')
      const { data: res2 } = await this.$http.delete(
        `roles/${role.id}/rights/${id2}`
      )
      if (res2.meta.status !== 200) return this.$message.error('删除失败')
      role.children = res2.data
      this.$message.success('删除成功!')
    },
    // 获取角色列表
    async getRoleList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('角色列表获取失败')
      }
      this.roleList = res.data
      this.$message.success('角色列表获取成功')
      console.log(this.roleList)
    }
  }
}
</script>

<style lang="less" scoped>
.roles {
  min-width: 860px;
  .el-tag {
    margin: 7px;
  }
  .bdtop {
    border-top: 1px solid #eee;
  }
  .bdbottom {
    border-bottom: 1px solid #eee;
  }
  // 纵向居中
  .vcenter {
    display: flex;
    align-items: center;
  }
}
</style>
