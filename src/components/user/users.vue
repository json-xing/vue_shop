<template>
  <div class="user-list">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <!-- 搜索 -->
        <el-col :span="10">
          <el-input
            placeholder="请输入内容"
            class="input-with-select"
            clearable
            v-model="queryInfo.query"
            @input="getUserList"
            @clear="getUserList"
          >
            <el-button
              @click="getUserList"
              slot="append"
              icon="el-icon-search"
            ></el-button>
          </el-input>
        </el-col>
        <!-- 添加 -->
        <el-col :span="4">
          <el-button @click="addDialogVisible = true" type="primary"
            >添加用户</el-button
          >
        </el-col>
      </el-row>
      <!-- :data=userList =>父组件向子组件传递数据 -->
      <el-table border stripe :data="userList" style="width: 100%">
        <el-table-column type="index"> </el-table-column>
        <el-table-column prop="username" label="姓名" width="90">
        </el-table-column>
        <el-table-column prop="email" label="邮箱" width="120">
        </el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <!-- 作用域插槽加入 开关 -->
          <template slot-scope="scope">
            <el-switch
              @change="saveState(scope.row)"
              v-model="scope.row.mg_state"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="175">
          <!-- 作用域插槽 => 父组件拿到子组件中的数据 -->
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <el-tooltip
              :enterable="false"
              effect="dark"
              content="分配角色"
              placement="top-start"
            >
              <!-- 设置按钮 -->
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="this.queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog
      @close="addDialogClose"
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
    >
      <!-- 添加用户信息表单 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户信息对话框 -->
    <el-dialog
      @close="editDialogClose"
      title="修改用户信息"
      :visible.sync="editDialogVisible"
      width="50%"
    >
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules">
        <el-form-item label="用户名" label-width="70px">
          <el-input v-model="editForm.username" disabled=""></el-input>
        </el-form-item>
        <el-form-item label="邮箱" label-width="70px" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" label-width="70px" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRequest(editForm.id)"
          >确 定</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的邮箱!'))
    }
    // 验证手机号的规则
    var checkMobile = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的手机号!'))
    }
    return {
      queryInfo: { query: '', pagenum: 1, pagesize: 2 },
      userList: [],
      total: 0,

      // 控制添加用户对话框显示
      addDialogVisible: false,
      // 控制修改用户信息对话框显示
      editDialogVisible: false,

      // 添加用户数据
      addForm: { username: '', region: '', email: '', mobile: '' },
      // 修改用户数据
      editForm: {},

      // 用户名验证规则对象
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 修改用户信息验证规则对象
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    // 删除用户  async  await ??????????
    async removeUserById(id) {
      // 弹框确认删除
      const res = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (res !== 'confirm') return this.$message.info('已取消删除')
      const { data: result } = await this.$http.delete(`users/${id}`)
      if (result.meta.status !== 200) {
        return this.$message.error('删除失败请重试!')
      }
      this.$message.success('删除成功')
      this.getUserList()
    },
    // 发起修改用户信息请求
    async editRequest(id) {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请输入合法的格式后重试!!')
        const { data: res } = await this.$http.put(`users/${id}`, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        if (res.meta.status !== 200) {
          return this.$message.error('修改失败,请重试!')
        }
        // 关闭对话框
        this.editDialogVisible = false
        // 提示修改成功
        this.$message.success('修改成功!')
        // 刷新数据列表
        this.getUserList()
      })
    },
    // 监听修改用户信息对话框关闭事件(重置表单)
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    // 打开修改用户信息对话框
    async showEditDialog(id) {
      this.editDialogVisible = true
      const { data: res } = await this.$http.get(`users/${id}`)
      this.editForm = res.data
    },
    // 点击确定按钮添加用户
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加失败,请重试!')
        }
        this.$message.success('添加成功!')
      })
    },
    // 监听对话框关闭事件(重置表单)
    addDialogClose() {
      this.$refs.addFormRef.resetFields()
    },
    // 修改状态
    async saveState(userInfo) {
      // console.log(userInfo)
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('用户状态更新失败,请重试!')
      }
      this.$message.success('用户状态更新成功!')
    },
    // 监听页码值改变的事件
    handleCurrentChange(newPage) {
      // console.log(newPage)
      this.queryInfo.pagenum = newPage
      // pagenum 改变 重新发起请求
      this.getUserList()
    },
    // 监听pageSize改变的事件
    handleSizeChange(newPageSize) {
      console.log(newPageSize)
      this.queryInfo.pagesize = newPageSize
      // pageSize 改变 重新发起请求
      this.getUserList()
    },
    // 获取用户列表数据
    async getUserList() {
      console.log('发送获取用户列表请求')
      // 对象解构
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('用户列表获取失败')
      }
      this.userList = res.data.users
      this.total = res.data.total
      // console.log(res, this.queryInfo, this.userList)
    }
  }
}
</script>

<style lang="less" scoped></style>
