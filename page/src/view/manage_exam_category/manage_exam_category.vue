<template>
  <div>
    <Card shadow>
      <Button type="primary" @click="addCategory(0)">新增顶级分类</Button>

      <!-- 分类表格 -->
      <tree-table
        expand-key="name"
        :expand-type="false"
        :selectable="false"
        :columns="categoryList"
        :data="categoryListData"
        :stripe="true"
        :border="true"
        :style="{margin:'20px 0'}"
      >
        <template slot="ccontrol" slot-scope="scope">
          <!-- {{ `${JSON.stringify(scope)}` }} -->
          <Button
            v-show="scope.row.parent_id === 0"
            type="info"
            size="small"
            :style="{marginRight: '5px'}"
            @click="addCategory(scope.row.id)"
          >新建下级分类</Button>
          <Button type="error" size="small" :style="{marginRight: '5px'}" @click="deleteCategory(scope.row.id)">删除</Button>
        </template>
      </tree-table>

      <!-- 新增分类模态框 -->
      <Modal v-model="addCategoryModel" title="新增分类" :loading="loading" @on-ok="addCategoryOk()">
        <Form :model="addCategoryInfo" label-position="right" :label-width="100" @submit.native.prevent="false">
          <FormItem label="分类名">
            <Input v-model="addCategoryInfo.name"></Input>
          </FormItem>
        </Form>
      </Modal>

      <!-- 删除用户操作 -->
      <Modal v-model="deleteCategoryModel" width="360">
        <p slot="header" style="color:#f60;text-align:center">
          <Icon type="ios-information-circle"></Icon>
          <span>删除确认</span>
        </p>
        <div style="text-align:center">
          <p>删除该分类后，对应的下级分类也将被删除。</p>
          <p>是否继续删除</p>
        </div>
        <div slot="footer">
          <Button type="error" size="large" long @click="deleteCagegoryOk">删除</Button>
        </div>
      </Modal>

    </Card>
  </div>
</template>

<script>
import { getExamCategoryList, addExamCategory, deleteCategory } from '@/api/data'
export default {
  name: 'manage_exam_category',
  data () {
    return {
      categoryList: [
        {
          title: '分类名',
          key: 'name'
        },
        {
          title: '分类操作',
          key: 'ccontrol',
          type: 'template',
          template: 'ccontrol'
        }
      ],
      categoryListData: [],
      loading: true,
      addCategoryModel: false,
      addCategoryInfo: {
        name: '',
        parent_id: 0
      },
      deleteCategoryModel: false,
      deleteCategoryId: 0
    }
  },
  methods: {
    getExamCategoryListInfo () {
      const vm = this
      return getExamCategoryList().then(res => {
        vm.categoryListData = vm.reduceCategoryList(res)
      })
    },
    reduceCategoryList (item) {
      return item.data.data.ExamCategoryTopList.reduce((acc, cur) => {
        return cur.parent_id === 0
          ? [...acc, cur]
          : acc.map(item => {
            item.children = item.children ? item.children : []
            return item.id === cur.parent_id
              ? { ...item, children: [...item.children, cur] }
              : item
          })
      }, [])
    },
    addCategory (parent_id) {
      const vm = this
      vm.addCategoryModel = true
      vm.addCategoryInfo.parent_id = parent_id
    },
    addCategoryOk () {
      const vm = this
      if (!vm.addCategoryInfo.name) {
        vm.$Message.error('分类名不能为空！')
        vm.addCategoryModel = false
        return false
      }
      addExamCategory(vm.addCategoryInfo)
        .then(res => {
          vm.addCategoryInfo.name = ''
          vm.$Message.success('添加成功！')
          vm.getExamCategoryListInfo()
        })
        .catch(err => {
          vm.$Message.error(err.response.data.message || '添加失败！')
        })

      vm.addCategoryModel = false
    },
    deleteCategory (id) {
      const vm = this
      vm.deleteCategoryId = id
      vm.deleteCategoryModel = true
    },
    deleteCagegoryOk () {
      const vm = this
      deleteCategory(vm.deleteCategoryId)
        .then(res => {
          vm.$Message.success('删除成功！')
          vm.getExamCategoryListInfo()
        })
        .catch(err => {
          vm.$Message.error(err.response.data.message || '删除失败！')
        })

      vm.deleteCategoryModel = false
    }
  },
  created () {
    const vm = this
    vm.getExamCategoryListInfo()
  }
}
</script>

<style>
</style>
