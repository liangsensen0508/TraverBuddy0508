<template>
  <div class="complaint-page">
    <!-- 顶部导航栏 -->
    <van-nav-bar
      title="投诉与建议"
      left-arrow
      :border="false"
      @click-left="onBack"
    />

    <!-- 顶部说明卡片：告诉用户提交后会怎么处理 -->
    <div class="intro-card">
      <van-icon name="info-o" size="18" class="intro-icon" />
      <div class="intro-text">
        <p class="intro-title">我们重视每一条反馈</p>
        <p class="intro-desc">
          提交后将在 1-3 个工作日内处理，请保持手机畅通。
        </p>
      </div>
    </div>

    <!-- 表单卡片 -->
    <div class="form-card">
      <!-- 投诉类型：单选标签 -->
      <div class="block">
        <div class="block-title">投诉类型</div>
        <div class="type-list">
          <div
            v-for="t in types"
            :key="t"
            class="type-item"
            :class="{ active: form.type === t }"
            @click="form.type = t"
          >
            {{ t }}
          </div>
        </div>
      </div>

      <!-- 订单号：选填，便于快速核实 -->
      <div class="block">
        <div class="block-title">
          订单号 <span class="optional">（选填）</span>
        </div>
        <van-field
          v-model="form.orderNo"
          class="form-field"
          maxlength="32"
          placeholder="填写订单号可加快核实"
        />
      </div>

      <!-- 投诉内容：必填，最多 200 字，自带字数统计 -->
      <div class="block">
        <div class="block-title">投诉内容</div>
        <van-field
          v-model="form.content"
          class="form-field content-field"
          type="textarea"
          rows="4"
          maxlength="200"
          show-word-limit
          placeholder="请描述时间、地点和具体情况，便于我们快速核实"
        />
      </div>

      <!-- 凭证图片：选填，最多 3 张 -->
      <div class="block">
        <div class="block-title">
          上传凭证 <span class="optional">（选填，最多 3 张）</span>
        </div>
        <!-- Vant 会自动读取图片并生成预览，无需手动转 Base64 -->
        <van-uploader v-model="fileList" :max-count="3" />
      </div>

      <!-- 联系方式：必填，用于回访 -->
      <div class="block">
        <div class="block-title">联系方式</div>
        <van-field
          v-model="form.phone"
          class="form-field"
          type="tel"
          maxlength="11"
          placeholder="请输入手机号，便于我们回访"
        />
      </div>
    </div>

    <!-- 提交按钮：submitting 期间显示加载并禁用重复点击 -->
    <div class="submit-wrap">
      <van-button
        type="primary"
        round
        block
        :loading="submitting"
        loading-text="提交中..."
        @click="onSubmit"
      >
        提交投诉
      </van-button>
    </div>

    <!-- 底部补充说明 -->
    <p class="agreement">提交即表示同意《投诉处理规则》</p>
    <p class="hotline">
      投诉热线：<a href="tel:4008001234">400-800-1234</a>（9:00-21:00）
    </p>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, type UploaderFileListItem } from 'vant'

const router = useRouter()

/** 可选的投诉类型 */
const types = ['景区服务', '商家服务', '交通出行', '导游服务', '其他']

/** 表单数据：类型、订单号（选填）、投诉内容、手机号 */
const form = reactive({
  type: '',
  orderNo: '',
  content: '',
  phone: '',
})

/** 已选择的凭证图片，最多 3 张；提交接口接入后上传其中的 file 文件 */
const fileList = ref<UploaderFileListItem[]>([])

/** 是否正在提交：用于按钮 loading 与防重复点击 */
const submitting = ref(false)

/**
 * 表单校验：类型必选、内容必填、手机号格式正确
 * 校验失败时给出对应提示并返回 false
 */
function validate() {
  if (!form.type) {
    showToast('请选择投诉类型')
    return false
  }
  if (!form.content.trim()) {
    showToast('请填写投诉内容')
    return false
  }
  // 简单校验大陆手机号：1 开头、第二位 3-9、共 11 位
  if (!/^1[3-9]\d{9}$/.test(form.phone)) {
    showToast('请输入正确的手机号')
    return false
  }
  return true
}

/** 清空表单，方便继续提交下一条 */
function resetForm() {
  form.type = ''
  form.orderNo = ''
  form.content = ''
  form.phone = ''
  fileList.value = []
}

/**
 * 提交：先校验，再模拟请求（接口未接入，用 800ms 延时占位）
 * 成功后提示并清空表单
 */
function onSubmit() {
  if (!validate()) return

  submitting.value = true
  // TODO: 接入真实接口后替换为 POST 提交，并处理成功 / 失败分支
  setTimeout(() => {
    submitting.value = false
    showToast('提交成功，我们将在 1-3 个工作日内处理')
    resetForm()
  }, 800)
}

/** 返回上一页，没有历史记录时回首页 */
function onBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<style scoped lang="less">
@primary: #3d9bff;
@text-main: #1f2a3d;
@text-sub: #8a94a6;

.complaint-page {
  min-height: 100vh;
  // 底部留白，兼容 iPhone 安全区
  padding-bottom: calc(24px + env(safe-area-inset-bottom));

  :deep(.van-nav-bar) {
    background: #fff;
  }
}

/* 顶部说明卡片：浅蓝渐变，弱化视觉但保证可读 */
.intro-card {
  display: flex;
  gap: 10px;
  margin: 12px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #eaf4ff, #dcebff);
  border-radius: 14px;

  .intro-icon {
    flex-shrink: 0;
    margin-top: 1px;
    color: @primary;
  }

  .intro-title {
    margin: 0;
    font-size: 13px;
    font-weight: 700;
    color: @text-main;
  }

  .intro-desc {
    margin: 4px 0 0;
    font-size: 12px;
    line-height: 1.5;
    color: #5b6b80;
  }

  p {
    margin: 0;
  }
}

/* 表单卡片 */
.form-card {
  margin: 0 12px;
  padding: 4px 16px 16px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 14px rgba(31, 62, 110, 0.06);

  .block {
    padding-top: 14px;
  }

  .block-title {
    font-size: 14px;
    font-weight: 700;
    color: @text-main;

    // 选填 / 张数限制的灰色小字
    .optional {
      font-size: 11px;
      font-weight: 400;
      color: @text-sub;
    }
  }

  // 投诉类型标签：默认描边，选中后蓝底蓝字
  .type-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;

    .type-item {
      padding: 6px 14px;
      font-size: 12px;
      color: #5b6b80;
      background: #f7f9fc;
      border: 1px solid #e6eef8;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s ease;

      &.active {
        font-weight: 600;
        color: @primary;
        background: #eaf4ff;
        border-color: @primary;
      }
    }
  }

  // 输入框：去掉 Vant 默认下边框，改成浅灰圆角块
  :deep(.form-field) {
    margin-top: 8px;
    padding: 10px 12px;
    background: #f7f9fc;
    border-radius: 10px;

    &::after {
      display: none;
    }

    .van-field__control {
      font-size: 13px;
      color: @text-main;
    }
  }

  // 多行文本域单独加高，字数统计靠右下
  :deep(.content-field) {
    padding: 10px 12px 6px;

    .van-field__control {
      min-height: 84px;
      line-height: 1.6;
    }
  }

  // 上传占位框：虚线圆角，与输入框风格统一
  :deep(.van-uploader__upload) {
    width: 76px;
    height: 76px;
    margin: 10px 8px 0 0;
    background: #f7f9fc;
    border: 1px dashed #d5e2f0;
    border-radius: 10px;
  }

  // 已上传图片预览同样圆角
  :deep(.van-uploader__preview-image) {
    border-radius: 10px;
    overflow: hidden;
  }
}

/* 提交区 */
.submit-wrap {
  margin: 18px 12px 0;

  // 主按钮使用主题蓝渐变，与全局视觉一致
  :deep(.van-button--primary) {
    height: 46px;
    font-size: 15px;
    background: linear-gradient(135deg, #4aa8ff, #3d9bff);
    border: none;
    box-shadow: 0 6px 16px rgba(61, 155, 255, 0.3);
  }
}

.agreement {
  margin: 12px 0 0;
  font-size: 11px;
  text-align: center;
  color: #b2bccb;
}

.hotline {
  margin: 6px 0 0;
  font-size: 11px;
  text-align: center;
  color: @text-sub;

  a {
    color: @primary;
    text-decoration: none;
  }
}
</style>
