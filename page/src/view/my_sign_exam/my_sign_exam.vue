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
        @on-change="getSignInfoList"
      />
    </Card>
  </div>
</template>

<script>
import { getSignInfoList, cancleSignInfo } from '@/api/data'
import * as moment from 'moment'
export default {
  name: 'my_sign_exam_child',
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
                    type: 'error',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.cancleSignExam(params.row.uid, params.row.eid)
                    }
                  }
                },
                '取消预约'
              )
            ])
          }
        }
      ],
      ExamList: []
    }
  },
  methods: {
    getSignInfoList (pageNum) {
      const vm = this
      getSignInfoList(pageNum || 1, vm.pagesize).then(res => {
        vm.renderExamList(res)
      })
    },
    renderExamList (res) {
      const vm = this
      vm.totalNum = res.data.data.examInfoCountTotal
      vm.ExamList = res.data.data.SignInfoList.map(item => {
        return {
          uid: item.uid,
          eid: item.eid,
          ...item.ExamInfo,
          time: moment(item.ExamInfo.time).format('YYYY-MM-DD hh:mm:ss'),
          category: item.ExamInfo.ExamCategoryInfo.name
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
    cancleSignExam (uid, eid) {
      const vm = this
      cancleSignInfo(uid, eid)
        .then(res => {
          vm.getSignInfoList(1)
          vm.$Message.success('取消成功！')
        })
        .catch(err => {
          vm.$Message.error(err.response.data.message)
        })
    }
  },
  created () {
    const vm = this
    vm.getSignInfoList(1)
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
