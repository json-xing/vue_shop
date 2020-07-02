<template>
  <div class="cate">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加分类 -->
      <el-row>
        <el-col>
          <el-button @click="showAddDialog" type="primary">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <tree-table
        class="tree-table"
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i
            style="color:lightgreen"
            v-if="scope.row.cat_deleted == false"
            class="el-icon-success"
          ></i>
          <i style="color:red" v-else class="el-icon-error"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0" type="primary" size="mini"
            >标签一</el-tag
          >
          <el-tag
            v-else-if="scope.row.cat_level === 1"
            type="success"
            size="mini"
            >标签二</el-tag
          >
          <el-tag
            v-else-if="scope.row.cat_level === 2"
            type="warning"
            size="mini"
            >标签三</el-tag
          >
        </template>
        <!-- 操作 -->
        <template slot="set">
          <el-button type="primary" class="el-icon-edit" size="mini"
            >编辑</el-button
          >
          <el-button type="danger" class="el-icon-delete" size="mini"
            >删除</el-button
          >
        </template>
      </tree-table>
      <!-- 分页导航 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog
      @close="addDialogClose"
      title="添加分类"
      :visible.sync="addDialogVisible"
      width="50%"
    >
      <el-form
        :model="addCateForm"
        :rules="rules"
        label-width="100px"
        ref="addFormRef"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- 级联选择器
          options:数据源;props:配置对象; v-model:选中项的Id,必须为数组 -->
          <el-cascader
            :options="parentCateList"
            :props="cascaderProps"
            v-model="selectedKeys"
            @change="selectedChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类列表
      cateList: [],
      // 商品类别总数
      total: 0,
      // 渲染商品列表列数据
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name',
          width: '250px'
        },
        {
          label: '是否有效',
          // 将当前列指定为模板列
          type: 'template',
          // 当前列使用的模板名称
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'set'
        }
      ],

      // 控制添加分类对话框显示
      addDialogVisible: false,
      // 添加分类表单数据对象
      addCateForm: { cat_name: '', cat_pid: 0, cat_level: 0 },
      // 添加分类表单验证规则对象
      rules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ]
      },

      // 父级分类列表数据源
      parentCateList: [],
      // 级联选择器配置对象
      cascaderProps: {
        expandTrigger: 'hover',
        checkStrictly: true,
        value: 'cat_id', // 选中的属性值
        label: 'cat_name', // 看到的属性值
        children: 'children' // 嵌套对象
      },
      // 选中的父级分类的Id数组
      selectedKeys: []
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 添加分类(发送添加分类请求)
    addCate() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        if (res.meta.status !== 201) return this.$message.error('添加分类失败')
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addDialogVisible = false
      })
    },
    // 监听添加分类对话框关闭事件
    addDialogClose() {
      // 重置表单
      this.$refs.addFormRef.resetFields()
      // 重置级联选择器
      this.selectedKeys = []
      // 重置添加分类表单数据
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 选择项变化触发的事件
    selectedChange() {
      if (this.selectedKeys.length > 0) {
        // 添加分类的父Id  cat_pid
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        // 添加分类的名称 cat_name
        // 添加分类的等级 cat_level
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        // 重置数据项
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 获取父级分类列表数据
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) return this.$message.error('数据获取失败')
      this.parentCateList = res.data
    },
    // 展示添加分类对话框
    showAddDialog() {
      this.getParentCateList()
      this.addDialogVisible = true
    },

    // 监听当前页码
    handleCurrentChange(newpagenum) {
      this.queryInfo.pagenum = newpagenum
      this.getCateList()
    },
    // 监听当前pageSize
    handleSizeChange(newpagesize) {
      this.queryInfo.pagesize = newpagesize
      this.getCateList()
    },

    // 获取商品分类列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('商品分类列表获取失败')
      }
      // 获取商品分类列表数据
      this.cateList = res.data.result
      // 获取商品分类总数
      this.total = res.data.total
      console.log(this.cateList, this.total)
    }
  }
}
</script>

<style lang="less" scoped></style>
