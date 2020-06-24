<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="" />
      </div>
      <!-- 登录表单 -->
      <el-form
        class="login_form"
        :model="loginForm"
        :rules="loginFormRules"
        ref="loginFormRef"
        label-width="0px"
      >
        <!-- 用户名 -->
        <el-form-item prop="username" label>
          <!-- 用户名 -->
          <el-input
            @blur="loginFormVerify"
            v-model="loginForm.username"
            prefix-icon="iconfont icon-user"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            @blur="loginFormVerify"
            v-model="loginForm.password"
            type="password"
          >
            <i slot="prefix" class="iconfont icon-password"></i>
          </el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btns">
          <el-button @click="login" type="primary" :disabled="loginBtnActive"
            >登录</el-button
          >
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      loginFormRules: {
        username: [
          { required: true, message: '验证用户名长度', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '验证密码长度', trigger: 'blur' },
          { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
        ]
      },
      loginBtnActive: true
    }
  },
  methods: {
    // 重置登录表格
    resetLoginForm() {
      // console.log(this)
      this.$refs.loginFormRef.resetFields()
    },
    // 校验 更新 登录按钮状态
    loginFormVerify() {
      this.$refs.loginFormRef.validate(valid => {
        if (valid) {
          this.loginBtnActive = false
        } else {
          this.loginBtnActive = true
        }
      })
    },
    // 登录请求
    login() {
      this.$refs.loginFormRef.validate(async valid => {
        if (valid) {
          // 对象解构
          const { data: res } = await this.$http.post('login', this.loginForm)
          // if (res.meta.status === 200) {
          //   return console.log('登录成功')
          // } else {
          //   console.log('登陆失败')
          // }
          // 简化
          if (res.meta.status !== 200) return this.$message.error('登陆失败')
          this.$message.success('登陆成功')
          // 登录成功之后 将token保存在sessionStorage
          sessionStorage.setItem('token', res.data.token)
          this.$router.push('/home')
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
  .login_box {
    background: white;
    width: 450px;
    height: 300px;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    // 头像
    .avatar_box {
      // 先形状
      width: 130px;
      height: 130px;
      border: 1px solid #eee;
      border-radius: 50%;
      padding: 10px;
      box-shadow: 0 0 10px #ddd;
      background-color: white;
      // 再位置
      position: absolute;
      transform: translate(-50%, -50%);
      left: 50%;
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
      }
    }
    .login_form {
      width: 100%;
      position: absolute;
      bottom: 0;
      padding: 20px;
      box-sizing: border-box;
      .btns {
        text-align: end;
        // display: flex;
        // justify-content: flex-end;
      }
    }
  }
}
</style>
