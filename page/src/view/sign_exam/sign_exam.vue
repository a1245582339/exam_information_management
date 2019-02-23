<template>
  <div>
    <Card shadow>
      <!--  考试信息列表  -->
      <Table stripe :columns="examListTitle" :data="ExamList" :style="{margin:'20px 0'}"></Table>
      <!-- 分页组件 -->
      <Page
        :total="totalNum"
        :page-size="pagesize"
        :style="{margin:'20px 0'}"
        @on-change="getExamInfoList"
      />
    </Card>
  </div>
</template>

<script>
import { getExamInfoList, addSignInfo } from '@/api/data'
import * as moment from 'moment'
export default {
  name: 'sign_exam_child',
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
                    type: 'primary',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.signExam(params.row.id)
                    }
                  }
                },
                '尝试预约'
              )
            ])
          }
        }
      ],
      ExamList: []
    }
  },
  methods: {
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
    showDetail (content) {
      this.$Modal.info({
        title: '考试详情',
        content: content,
        width: '800px'
      })
    },
    signExam (eid) {
      const vm = this
      addSignInfo(eid)
        .then(res => {
          vm.$Message.success('预约成功，开始报名前两小时会提醒您！')
        })
        .catch(err => {
          vm.$Message.error(err.response.data.message)
        })
    }
  },
  created () {
    const vm = this
    vm.getExamInfoList(1)
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      if (!vm.$store.getters.CurrentUserNameAuthStatus) {
        vm.$router.replace('/personal_info/personal_info_child')
      }
    })
  }
}
</script>

<style scoped>
</style>
