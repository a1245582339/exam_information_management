<template>
  <div>
    <Card shadow>
      <Button type="primary" @click="addExamInfo">新增考试信息</Button>

      <!--  考试信息列表  -->
      <Table stripe :columns="examListTitle" :data="ExamList" :style="{margin:'20px 0'}"></Table>
      <!-- 分页组件 -->
      <Page
        :total="totalNum"
        :page-size="pagesize"
        :style="{margin:'20px 0'}"
        @on-change="getExamInfoList"
      />

      <!-- 新增考试信息模态框 -->
      <Modal v-model="addExamInfoModel" title="新增考试信息" :width="1024">
        <Form label-position="right" :label-width="100" :style="{width: '960px'}">
          <Row>
            <Col span="8">
              <Col span="24">
                <FormItem label="标题">
                  <Input v-model="examInfo.title"></Input>
                </FormItem>
              </Col>
              <Col span="24">
                <FormItem label="作者">
                  <Input v-model="examInfo.author"></Input>
                </FormItem>
              </Col>
              <Col span="24">
                <FormItem label="报名URL">
                  <Input v-model="examInfo.url"></Input>
                </FormItem>
              </Col>
              <Col span="24">
                <FormItem label="分类">
                  <Select v-model="examInfo.cid" filterable>
                    <Option
                      v-for="item in examCategoryList"
                      :value="item.id"
                      :key="item.id"
                    >{{ item.name }}</Option>
                  </Select>
                </FormItem>
              </Col>
              <Col span="24">
                <FormItem label="时间">
                  <DatePicker type="datetime" :style="{width: '100%'}" @on-change="setDateTime"></DatePicker>
                </FormItem>
              </Col>
            </Col>
            <Col span="16">
              <Col span="24">
                <FormItem label="详情">
                  <div :id="editorId"></div>
                </FormItem>
              </Col>
            </Col>
          </Row>
        </Form>
        <div slot="footer">
          <Button type="text" @click="closeAddInfoModal">取消</Button>
          <Button type="primary" @click="addExamInfoOk" :loading="examSubmitLoading">确定</Button>
        </div>
      </Modal>
    </Card>
  </div>
</template>

<script>
import { getExamCategoryList, getExamInfoList, addExamInfo, deleteExamInfo } from '@/api/data'
import Editor from 'wangeditor'
import { oneOf } from '@/libs/tools'
import * as moment from 'moment'
export default {
  name: 'exam_info_manage_child',
  props: {
    value: {
      type: String,
      default: ''
    },
    /**
     * 绑定的值的类型, enum: ['html', 'text']
     */
    valueType: {
      type: String,
      default: 'html',
      validator: val => {
        return oneOf(val, ['html', 'text'])
      }
    },
    /**
     * @description 设置change事件触发时间间隔
     */
    changeInterval: {
      type: Number,
      default: 200
    },
    /**
     * @description 是否开启本地存储
     */
    cache: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      totalNum: 0,
      pagesize: 10,
      examListTitle: [
        {
          title: '考试ID',
          key: 'id',
          width: '80px'
        },
        {
          title: '标题',
          key: 'title'
        },
        {
          title: '作者',
          key: 'author',
          width: '130px'
        },
        {
          title: '考试分类',
          key: 'category',
          width: '150px'
        },
        {
          title: '考试时间',
          key: 'time'
        },
        {
          title: '报考链接',
          key: 'url',
          render: (h, params) => {
            return h('div', [
              h(
                'Button',
                {
                  props: {
                    type: 'info',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      window.open(params.row.url)
                    }
                  }
                },
                '报考链接'
              )
            ])
          }
        },
        {
          title: '详情',
          key: 'content',
          render: (h, params) => {
            return h('div', [
              h(
                'Button',
                {
                  props: {
                    type: 'info',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.showDetail(params.row.content)
                    }
                  }
                },
                '详情'
              )
            ])
          }
        },
        {
          title: '操作',
          key: 'action',
          render: (h, params) => {
            return h('div', [
              h(
                'Button',
                {
                  props: {
                    type: 'error',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.deleteExamInfo(params.row.id)
                    }
                  }
                },
                '删除'
              )
            ])
          }
        }
      ],
      ExamList: [],
      addExamInfoModel: false,
      examSubmitLoading: false,
      examCategoryList: [],
      examInfo: {
        title: '',
        author: '',
        url: '',
        cid: 0,
        content: '',
        time: ''
      }
    }
  },
  computed: {
    editorId () {
      return `editor${this._uid}`
    }
  },
  methods: {
    addExamInfo () {
      const vm = this
      vm.addExamInfoModel = true
    },
    setDateTime (date) {
      const vm = this
      vm.examInfo.time = Date.parse(date)
    },
    addExamInfoOk () {
      const vm = this
      if (!vm.checkObjKV(vm.examInfo)) {
        return false
      }
      vm.examSubmitLoading = true
      addExamInfo(vm.examInfo)
        .then(res => {
          vm.$Message.success('添加成功！')
          vm.examSubmitLoading = false
          vm.getExamInfoList(1)
          vm.closeAddInfoModal()
        })
        .catch(err => {
          console.log('err => ', err)
          vm.$Message.error('添加失败！')
          vm.examSubmitLoading = false
        })
    },
    checkObjKV (obj) {
      const vm = this
      for (var key in obj) {
        if (!obj[key]) {
          vm.$Message.error('信息填写不完整！')
          return
        }
      }
      return true
    },
    closeAddInfoModal () {
      const vm = this
      vm.addExamInfoModel = false
      vm.examInfo = {
        title: '',
        author: '',
        url: '',
        cid: 0,
        content: '',
        time: ''
      }
    },
    getExamInfoList (pageNum) {
      const vm = this
      getExamInfoList(pageNum || 1, vm.pagesize).then(res => {
        vm.renderExamList(res)
      })
    },
    renderExamList (res) {
      const vm = this
      vm.totalNum = res.data.data.examInfoCountTotal
      vm.ExamList = res.data.data.examInfoList.map(item => {
        return {
          ...item,
          time: moment(item.time).format('YYYY-MM-DD hh:mm:ss'),
          category: item.ExamCategoryInfo.name
        }
      })
    },
    deleteExamInfo (eid) {
      const vm = this
      deleteExamInfo(eid)
        .then(res => {
          vm.$Message.success('删除成功！')
          vm.getExamInfoList(1)
        })
        .catch(err => {
          console.log('err => ', err)
          vm.$Message.error('删除失败！')
        })
    },
    showDetail (content) {
      this.$Modal.info({
        title: '考试详情',
        content: content,
        width: '800px'
      })
    }
  },
  created () {
    const vm = this
    getExamCategoryList().then(res => {
      vm.examCategoryList = res.data.data.ExamCategoryTopList
    })
    vm.getExamInfoList(1)
  },
  mounted () {
    this.editor = new Editor(`#${this.editorId}`)
    this.editor.customConfig.menus = [
      'head', // 标题
      'bold', // 粗体
      'fontSize', // 字号
      'fontName', // 字体
      'italic', // 斜体
      'underline', // 下划线
      'strikeThrough', // 删除线
      'foreColor', // 文字颜色
      'backColor', // 背景颜色
      'image' // 插入图片
    ]
    this.editor.customConfig.onchange = html => {
      // let text = this.editor.txt.text()
      // if (this.cache) localStorage.editorCache = html
      // this.$emit('input', this.valueType === 'html' ? html : text)
      // this.$emit('on-change', html, text)
      this.examInfo.content = html
    }
    this.editor.customConfig.onchangeTimeout = this.changeInterval

    // create这个方法一定要在所有配置项之后调用
    this.editor.create()
    // 如果本地有存储加载本地存储内容
    let html = this.value || localStorage.editorCache
    if (html) this.editor.txt.html(html)
  }
}
</script>

<style scoped>
</style>
