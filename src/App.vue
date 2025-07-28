<script setup>
import { Icon } from '@iconify/vue'
import { ref, computed, onMounted, nextTick } from 'vue'

// 搜索状态
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 18

// 弹窗状态
const showModal = ref(false)
const selectedPlugin = ref(null)

// 视图模式
const viewMode = ref('grid') // 'grid' 或 'list'

// 主题模式
const isDarkMode = ref(false)

// 数据加载状态
const isLoading = ref(true)
const loadingStatus = ref('正在从 GitHub 获取插件列表...')
const showPlugins = ref(false)
const plugins = ref([])
const error = ref(null)

// 获取插件数据
const fetchPlugins = async () => {
  try {
    loadingStatus.value = '正在从 GitHub 获取插件列表...'
    // 修复网络请求 - 添加错误重试机制和更好的错误处理
    const response = await fetch('https://raw.githubusercontent.com/MaiM-with-u/plugin-repo/main/plugin_details.json', {
      cache: 'no-cache', // 避免缓存问题
      headers: {
        'Accept': 'application/json'
      }
    })
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} - 获取插件数据失败`)
    }
    
    loadingStatus.value = '正在解析插件数据...'
    const data = await response.json()
    console.log('获取到的插件数据:', data)
    
    loadingStatus.value = '正在处理插件信息...'
    // 转换数据格式
    plugins.value = data.map((item, index) => {
      const manifest = item.manifest
      // 尝试多种可能的仓库URL字段
      const repositoryUrl = manifest.repository_url || 
                           manifest.repositoryUrl || 
                           manifest.repository || 
                           item.repository_url || 
                           item.repositoryUrl || 
                           item.repository || 
                           ''
      
      console.log('插件仓库链接:', manifest.name, repositoryUrl)
      
      return {
        id: item.id,
        name: manifest.name,
        version: manifest.version,
        description: manifest.description,
        author: manifest.author?.name || '未知作者',
        authorUrl: manifest.author?.url || '',
        license: manifest.license || 'Unknown',
        categories: manifest.categories || [],
        keywords: manifest.keywords || [],
        minVersion: manifest.host_application?.min_version || '0.8.0',
        maxVersion: manifest.host_application?.max_version || '0.8.0',
        repositoryUrl: repositoryUrl,
        homepageUrl: manifest.homepage_url || manifest.homepageUrl || '',
        // 合并标签，显示分类和关键词
        tags: [...(manifest.categories || []), ...(manifest.keywords || [])].slice(0, 5),
        // 模拟一些额外数据
        downloads: Math.floor(Math.random() * 10000) + 100,
        featured: Math.random() > 0.7,
        // 根据类别选择图标
        icon: getIconByCategory(manifest.categories?.[0] || 'other')
      }
    })
    
    loadingStatus.value = '加载完成！'
  } catch (err) {
    error.value = err.message
    console.error('获取插件数据失败:', err)
  }
}

// 根据类别获取图标
const getIconByCategory = (category) => {
  const iconMap = {
    'Moderation': 'mdi:shield-check',
    'Group Management': 'mdi:account-group',
    'Admin Tools': 'mdi:tools',
    'Entertainment': 'mdi:gamepad-variant',
    'Game': 'mdi:controller-classic',
    'AI Tools': 'mdi:robot',
    'Search': 'mdi:magnify',
    'Content Retrieval': 'mdi:download',
    'Image Processing': 'mdi:image-edit',
    'Content Generation': 'mdi:creation',
    'music': 'mdi:music',
    '娱乐': 'mdi:emoticon-happy',
    '音乐': 'mdi:music-note',
    '图片': 'mdi:image',
    'API': 'mdi:api',
    '工具': 'mdi:wrench',
    '网络': 'mdi:web',
    'AI功能': 'mdi:brain',
    'Management': 'mdi:cog',
    'Expression': 'mdi:emoticon',
    'Picture': 'mdi:camera',
    '语音': 'mdi:microphone',
    '聊天增强': 'mdi:chat',
    'Developer Tools': 'mdi:code-braces',
    default: 'mdi:puzzle'
  }
  
  return iconMap[category] || iconMap.default
}

// 分页插件
const filteredPlugins = computed(() => {
  const filtered = plugins.value.filter(plugin => {
    const matchesSearch = plugin.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         plugin.description.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         plugin.author.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    return matchesSearch
  })
  
  // 按仓库链接状态排序：有链接的在前，没有链接的在后
  return filtered.sort((a, b) => {
    const aHasRepo = a.repositoryUrl && a.repositoryUrl.trim() !== ''
    const bHasRepo = b.repositoryUrl && b.repositoryUrl.trim() !== ''
    
    if (aHasRepo && !bHasRepo) return -1  // a有链接，b没有，a排前面
    if (!aHasRepo && bHasRepo) return 1   // a没有链接，b有，b排前面
    return 0  // 都有或都没有，保持原顺序
  })
})

// 分页插件
const paginatedPlugins = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredPlugins.value.slice(start, end)
})

// 总页数
const totalPages = computed(() => {
  return Math.ceil(filteredPlugins.value.length / itemsPerPage)
})

// 格式化下载数
const formatDownloads = (downloads) => {
  if (downloads >= 1000) {
    return (downloads / 1000).toFixed(1) + 'K'
  }
  return downloads.toString()
}

// 分页函数
const goToPage = (page) => {
  currentPage.value = page
}

// 显示插件详情
const showPluginDetails = (plugin) => {
  selectedPlugin.value = plugin
  showModal.value = true
  // 锁定背景滚动
  document.body.style.overflow = 'hidden'
}

// 关闭弹窗
const closeModal = () => {
  showModal.value = false
  selectedPlugin.value = null
  // 恢复背景滚动
  document.body.style.overflow = ''
}

// 切换视图模式
const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid'
}

// 切换视图模式并重新触发动画
const switchViewMode = async (mode) => {
  if (mode === viewMode.value) return
  
  showPlugins.value = false
  viewMode.value = mode
  
  await nextTick()
  setTimeout(() => {
    showPlugins.value = true
  }, 50)
}

// 跳转到插件仓库
const goToRepository = (plugin) => {
  console.log('尝试跳转到仓库:', plugin.name, plugin.repositoryUrl)
  
  if (plugin.repositoryUrl && plugin.repositoryUrl.trim() !== '') {
    // 确保URL是完整的链接 - 修复URL解析问题
    let url = plugin.repositoryUrl.trim()
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      // 如果不是完整URL，假设是GitHub仓库路径
      if (url.includes('/')) {
        url = 'https://github.com/' + url
      } else {
        console.warn('无效的仓库地址格式:', url)
        alert('仓库地址格式不正确，请检查插件配置')
        return
      }
    }
    
    console.log('正在打开仓库链接:', url)
    // 修复链接打开问题 - 添加错误处理
    try {
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('打开链接失败:', error)
      alert('无法打开链接，请手动复制地址：' + url)
    }
  } else {
    console.warn('插件没有仓库地址:', plugin.name)
    // 可以添加一个用户友好的提示
    alert('该插件暂无仓库链接')
  }
}

// 切换主题
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  // 保存主题设置到本地存储
  localStorage.setItem('darkMode', isDarkMode.value.toString())
}

// 注意事项弹窗状态
const showNotice = ref(false) // 初始化为 false，在 onMounted 中根据设置决定是否显示
const canCloseNotice = ref(false)
const dontShowNoticeAgain = ref(false)

// 关闭弹窗
const closeNotice = () => {
  if (canCloseNotice.value) {
    showNotice.value = false
    if (dontShowNoticeAgain.value) {
      localStorage.setItem('dontShowNoticeAgain', 'true')
      console.log('设置不再显示弹窗') // 调试日志
    }
  }
}

// 调试用：重置弹窗设置
const resetNoticeSettings = () => {
  localStorage.removeItem('dontShowNoticeAgain')
  showNotice.value = true
  canCloseNotice.value = false
  dontShowNoticeAgain.value = false
  setTimeout(() => {
    canCloseNotice.value = true
  }, 3000)
}

// 全局暴露重置方法用于调试
if (typeof window !== 'undefined') {
  window.resetNoticeSettings = resetNoticeSettings
}

// 初始化加载
onMounted(async () => {
  // 从本地存储加载主题设置
  const savedTheme = localStorage.getItem('darkMode')
  if (savedTheme !== null) {
    isDarkMode.value = savedTheme === 'true'
  }
  
  // 检查注意事项弹窗设置，优先处理弹窗逻辑
  const savedPreference = localStorage.getItem('dontShowNoticeAgain')
  console.log('弹窗设置检查:', savedPreference) // 调试日志
  if (savedPreference !== 'true') {
    // 如果用户没有选择不再显示，则显示弹窗
    console.log('显示注意事项弹窗') // 调试日志
    showNotice.value = true
    // 3秒后允许关闭注意事项弹窗
    setTimeout(() => {
      canCloseNotice.value = true
      console.log('允许关闭弹窗') // 调试日志
    }, 3000)
  } else {
    console.log('用户选择不再显示弹窗') // 调试日志
  }
  
  // 添加键盘事件监听
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (showModal.value) {
        closeModal()
      } else if (showNotice.value && canCloseNotice.value) {
        closeNotice()
      }
    }
  })
  
  // 异步获取插件数据，不影响弹窗显示
  fetchPluginsData()
})

// 分离插件数据获取逻辑
const fetchPluginsData = async () => {
  try {
    await fetchPlugins()
    
    // 模拟加载延迟
    await new Promise(resolve => setTimeout(resolve, 800))
    isLoading.value = false
    
    // 触发动画
    await nextTick()
    showPlugins.value = true
  } catch (err) {
    // 错误处理已经在 fetchPlugins 中完成
    isLoading.value = false
  }
}
</script>

<template>
  <div :class="[
    'min-h-screen transition-colors duration-300',
    isDarkMode 
      ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
      : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
  ]">
    <!-- 顶栏 -->
    <div :class="[
      'fixed top-0 left-0 right-0 z-40 shadow-sm border-b transition-colors duration-300',
      isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
    ]">
      <div class="container mx-auto px-4 py-2">
        <div class="flex items-center justify-between">
          <!-- 左侧标题 -->
          <div class="flex items-center gap-2">
            <Icon icon="mdi:puzzle" class="text-lg" style="color: #4d9fff" />
            <span :class="[
              'text-lg font-semibold transition-colors',
              isDarkMode ? 'text-white' : 'text-gray-800'
            ]">插件仓库</span>
          </div>
          
          <!-- 右侧按钮组 -->
          <div class="flex items-center gap-2">
            <!-- 主题切换按钮 -->
            <button 
              @click="toggleTheme"
              :class="[
                'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105',
                isDarkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              ]"
              :title="isDarkMode ? '切换到浅色模式' : '切换到深色模式'"
            >
              <Icon :icon="isDarkMode ? 'mdi:white-balance-sunny' : 'mdi:moon-waning-crescent'" class="text-lg" />
            </button>
            
            <!-- GitHub链接 -->
            <a 
              href="https://github.com/MaiM-with-u/plugin-repo" 
              target="_blank" 
              rel="noopener noreferrer"
              :class="[
                'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105',
                isDarkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                  : 'bg-gray-900 hover:bg-gray-800 text-white'
              ]"
              title="查看GitHub仓库"
            >
              <Icon icon="mdi:github" class="text-lg" />
            </a>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 插件列表 -->
    <div :class="[
      'pt-32 pb-8 transition-colors duration-300',
      isDarkMode 
        ? 'bg-gradient-to-b from-gray-800 to-gray-900' 
        : 'bg-gradient-to-b from-gray-50 to-white'
    ]"
    style="min-height: calc(100vh - 160px);"
    >
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <h2 :class="[
            'text-4xl font-bold mb-4 transition-colors',
            isDarkMode ? 'text-white' : 'text-gray-800'
          ]">全部插件</h2>
          <p :class="[
            'text-xl mb-4 transition-colors',
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          ]">发现更多优秀插件</p>
          
          <!-- 插件总数显示 -->
          <div class="mb-8">
            <div :class="[
              'inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-colors',
              isDarkMode 
                ? 'bg-gray-800 border-gray-600 text-gray-300' 
                : 'bg-white border-gray-200 text-gray-600'
            ]">
              <Icon icon="mdi:package-variant" class="text-lg" />
              <span class="font-medium">
                共找到 <span :class="[
                  'font-bold text-lg',
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                ]">{{ filteredPlugins.length }}</span> 个插件
              </span>
              <span v-if="searchQuery.trim() !== ''" :class="[
                'text-sm px-2 py-1 rounded-md',
                isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-50 text-blue-600'
              ]">
                (已筛选)
              </span>
            </div>
          </div>
          
          <!-- 搜索框 -->
          <div class="max-w-md mx-auto mb-8">
            <div class="relative">
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="搜索插件..." 
                :class="[
                  'w-full px-4 py-3 pl-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-colors',
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                ]"
              />
              <Icon icon="mdi:magnify" :class="[
                'absolute left-4 top-3.5 text-xl',
                isDarkMode ? 'text-gray-400' : 'text-gray-400'
              ]" />
            </div>
          </div>
          
          <!-- 视图切换按钮 -->
          <div class="flex justify-center">
            <div :class="[
              'rounded-xl shadow-md p-1 flex transition-colors',
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            ]">
              <button 
                @click="switchViewMode('grid')"
                :class="[
                  'px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2',
                  viewMode === 'grid' 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                    : isDarkMode 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                ]"
                :style="viewMode === 'grid' ? 'background: linear-gradient(135deg, #4d9fff 0%, #6366f1 100%)' : ''"
              >
                <Icon icon="mdi:view-grid" />
                卡片视图
              </button>
              <button 
                @click="switchViewMode('list')"
                :class="[
                  'px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2',
                  viewMode === 'list' 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                    : isDarkMode 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                ]"
                :style="viewMode === 'list' ? 'background: linear-gradient(135deg, #4d9fff 0%, #6366f1 100%)' : ''"
              >
                <Icon icon="mdi:view-list" />
                列表视图
              </button>
            </div>
          </div>
        </div>
        
        <!-- 插件展示区域 -->
        <div v-if="isLoading" class="flex justify-center items-center py-20">
          <div class="flex flex-col items-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p :class="[
              'transition-colors text-lg font-medium',
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            ]">{{ loadingStatus }}</p>
          </div>
        </div>
        
        <div v-else-if="error" class="flex justify-center items-center py-20">
          <div class="flex flex-col items-center">
            <Icon icon="mdi:alert-circle" class="text-6xl text-red-500 mb-4" />
            <p :class="[
              'text-lg mb-4 transition-colors',
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            ]">{{ error }}</p>
            <button 
              @click="fetchPlugins" 
              class="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
            >
              重试
            </button>
          </div>
        </div>
        
        <div v-else-if="!error && plugins.length === 0" class="flex justify-center items-center py-20">
          <div class="flex flex-col items-center">
            <Icon icon="mdi:package-variant" class="text-6xl text-gray-400 mb-4" />
            <p :class="[
              'text-lg transition-colors',
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            ]">暂无插件数据</p>
          </div>
        </div>
        
        <div v-else-if="!error && viewMode === 'grid'">
          <!-- 卡片视图 -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative overflow-hidden">
            <div 
              v-for="(plugin, index) in paginatedPlugins" 
              :key="plugin.id"
              @click="showPluginDetails(plugin)"
              :class="[
                'plugin-card group rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border cursor-pointer relative',
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-100',
                { 'animate-card-sweep': showPlugins }
              ]"
              :style="{ 
                '--sweep-delay': `${Math.floor(index / 3) * 0.15 + (index % 3) * 0.1}s`
              }"
            >
              <div class="pb-12"> <!-- 为底部按钮预留空间 -->
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                      <Icon :icon="plugin.icon" class="text-xl text-white" />
                    </div>
                    <div>
                      <h3 :class="[
                        'font-bold group-hover:text-blue-600 transition-colors',
                        isDarkMode ? 'text-white' : 'text-gray-800'
                      ]">{{ plugin.name }}</h3>
                      <p :class="[
                        'text-xs',
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      ]">{{ plugin.author }}</p>
                    </div>
                  </div>
                  <div :class="[
                    'px-2 py-1 rounded-lg text-xs font-medium',
                    isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                  ]">v{{ plugin.version }}</div>
                </div>
                
                <p :class="[
                  'text-sm mb-4 line-clamp-2',
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                ]">{{ plugin.description }}</p>
                
                <div class="flex flex-wrap gap-1 mb-4">
                  <div 
                    v-for="tag in plugin.tags.slice(0, 3)" 
                    :key="tag"
                    :class="[
                      'px-2 py-1 rounded-md text-xs font-medium',
                      isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-50 text-blue-600'
                    ]"
                  >
                    {{ tag }}
                  </div>
                </div>
              </div>
              
              <!-- Repo按钮固定在右下角 -->
              <div class="absolute bottom-4 right-4">
                <button 
                  @click.stop="goToRepository(plugin)"
                  :disabled="!plugin.repositoryUrl || plugin.repositoryUrl.trim() === ''"
                  :class="[
                    'px-4 py-2 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200',
                    plugin.repositoryUrl && plugin.repositoryUrl.trim() !== '' 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white cursor-pointer' 
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  ]"
                  :style="plugin.repositoryUrl && plugin.repositoryUrl.trim() !== '' ? 'background: linear-gradient(135deg, #4d9fff 0%, #6366f1 100%)' : ''"
                  :title="plugin.repositoryUrl && plugin.repositoryUrl.trim() !== '' ? '查看仓库' : '暂无仓库链接'"
                >
                  <Icon icon="mdi:github" class="inline mr-1" />
                  Repo
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else-if="!error">
          <!-- 列表视图 -->
          <div class="space-y-4 relative overflow-hidden">
            <div 
              v-for="(plugin, index) in paginatedPlugins" 
              :key="plugin.id"
              @click="showPluginDetails(plugin)"
              :class="[
                'plugin-list-item group rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border cursor-pointer',
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-100',
                { 'animate-list-sweep': showPlugins }
              ]"
              :style="{ 
                '--sweep-delay': `${index * 0.1}s`
              }"
            >
              <div class="flex items-center gap-6">
                <!-- 插件图标 -->
                <div class="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon :icon="plugin.icon" class="text-2xl text-white" />
                </div>
                
                <!-- 插件信息 -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex-1 pr-4">
                      <h3 :class="[
                        'text-xl font-bold group-hover:text-blue-600 transition-colors mb-1',
                        isDarkMode ? 'text-white' : 'text-gray-800'
                      ]">{{ plugin.name }}</h3>
                      <p :class="[
                        'text-sm mb-2',
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      ]">作者：{{ plugin.author }}</p>
                      <p :class="[
                        'line-clamp-2 mb-3',
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      ]">{{ plugin.description }}</p>
                      
                      <!-- 标签 -->
                      <div class="flex flex-wrap gap-2">
                        <div 
                          v-for="tag in plugin.tags.slice(0, 4)" 
                          :key="tag"
                          :class="[
                            'px-2 py-1 rounded-md text-xs font-medium',
                            isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-50 text-blue-600'
                          ]"
                        >
                          {{ tag }}
                        </div>
                      </div>
                    </div>
                    
                    <!-- 右侧信息和按钮 -->
                    <div class="flex flex-col items-end gap-3 flex-shrink-0">
                      <!-- 版本 -->
                      <div class="text-right">
                        <div :class="[
                          'px-3 py-1 rounded-lg text-sm font-medium mb-2',
                          isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                        ]">v{{ plugin.version }}</div>
                      </div>
                      
                      <!-- 仓库按钮 -->
                      <button 
                        @click.stop="goToRepository(plugin)"
                        :disabled="!plugin.repositoryUrl || plugin.repositoryUrl.trim() === ''"
                        :class="[
                          'px-6 py-2 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 whitespace-nowrap',
                          plugin.repositoryUrl && plugin.repositoryUrl.trim() !== '' 
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white cursor-pointer' 
                            : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        ]"
                        :style="plugin.repositoryUrl && plugin.repositoryUrl.trim() !== '' ? 'background: linear-gradient(135deg, #4d9fff 0%, #6366f1 100%)' : ''"
                        :title="plugin.repositoryUrl && plugin.repositoryUrl.trim() !== '' ? '查看仓库' : '暂无仓库链接'"
                      >
                        <Icon icon="mdi:github" class="inline mr-1" />
                        Repo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="flex justify-center mt-12 pb-8" v-if="totalPages > 1">
          <div class="flex gap-2">
            <button 
              :class="[
                'w-10 h-10 rounded-xl border flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg',
                isDarkMode 
                  ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500' 
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-300'
              ]"
              :disabled="currentPage === 1"
              @click="goToPage(currentPage - 1)"
            >
              <Icon icon="mdi:chevron-left" />
            </button>
            <button 
              v-for="page in totalPages" 
              :key="page"
              @click="goToPage(page)"
              :class="[
                'w-10 h-10 rounded-xl flex items-center justify-center font-medium transition-all shadow-lg',
                currentPage === page 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                  : isDarkMode 
                    ? 'bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500' 
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-300'
              ]"
              :style="currentPage === page ? 'background: linear-gradient(135deg, #4d9fff 0%, #6366f1 100%)' : ''"
            >
              {{ page }}
            </button>
            <button 
              :class="[
                'w-10 h-10 rounded-xl border flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg',
                isDarkMode 
                  ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500' 
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-300'
              ]"
              :disabled="currentPage === totalPages"
              @click="goToPage(currentPage + 1)"
            >
              <Icon icon="mdi:chevron-right" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 插件详情弹窗 -->
    <Transition name="modal-backdrop">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center">
        <!-- 毛玻璃遮罩 -->
        <div 
          class="fixed inset-0 backdrop-blur-sm"
          @click="closeModal"
        ></div>
        
        <!-- 弹窗内容 -->
        <Transition name="modal-content" appear>
          <div v-if="showModal" :class="[
            'relative rounded-3xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto transition-colors',
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          ]">
          
          <div v-if="selectedPlugin" class="p-8">
          <!-- 插件头部信息 -->
          <div class="flex items-start gap-6 mb-6">
            <div class="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Icon :icon="selectedPlugin.icon" class="text-3xl text-white" />
            </div>
            <div class="flex-1">
              <h2 :class="[
                'text-3xl font-bold mb-2',
                isDarkMode ? 'text-white' : 'text-gray-800'
              ]">{{ selectedPlugin.name }}</h2>
              <div class="flex items-center gap-4 mb-2">
                <p :class="[
                  'text-lg',
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                ]">
                  <Icon icon="mdi:account" class="inline mr-1" />
                  作者：{{ selectedPlugin.author }}
                </p>
                <a 
                  v-if="selectedPlugin.authorUrl" 
                  :href="selectedPlugin.authorUrl" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  :class="[
                    'text-blue-500 hover:text-blue-600 transition-colors text-sm',
                    'flex items-center gap-1'
                  ]"
                  title="访问作者主页"
                >
                  <Icon icon="mdi:open-in-new" class="text-xs" />
                  主页
                </a>
              </div>
              <div :class="[
                'flex items-center gap-4 text-sm',
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              ]">
                <span>
                  <Icon icon="mdi:tag" class="inline mr-1" />
                  版本 {{ selectedPlugin.version }}
                </span>
                <span>
                  <Icon icon="mdi:license" class="inline mr-1" />
                  {{ selectedPlugin.license }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- 插件描述 -->
          <div class="mb-6">
            <h3 :class="[
              'text-xl font-semibold mb-3 flex items-center gap-2',
              isDarkMode ? 'text-white' : 'text-gray-800'
            ]">
              <Icon icon="mdi:information" />
              插件描述
            </h3>
            <p :class="[
              'leading-relaxed text-base',
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            ]">{{ selectedPlugin.description }}</p>
          </div>
          
          <!-- 分类和关键词 -->
          <div class="mb-6">
            <h3 :class="[
              'text-xl font-semibold mb-3 flex items-center gap-2',
              isDarkMode ? 'text-white' : 'text-gray-800'
            ]">
              <Icon icon="mdi:tag-multiple" />
              分类和标签
            </h3>
            <div class="space-y-3">
              <!-- 分类 -->
              <div v-if="selectedPlugin.categories && selectedPlugin.categories.length > 0">
                <p :class="[
                  'text-sm font-medium mb-2',
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                ]">分类：</p>
                <div class="flex flex-wrap gap-2">
                  <div 
                    v-for="category in selectedPlugin.categories" 
                    :key="category"
                    :class="[
                      'px-3 py-1 rounded-full text-sm font-medium',
                      isDarkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-50 text-purple-600'
                    ]"
                  >
                    {{ category }}
                  </div>
                </div>
              </div>
              <!-- 关键词 -->
              <div v-if="selectedPlugin.keywords && selectedPlugin.keywords.length > 0">
                <p :class="[
                  'text-sm font-medium mb-2',
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                ]">关键词：</p>
                <div class="flex flex-wrap gap-2">
                  <div 
                    v-for="keyword in selectedPlugin.keywords" 
                    :key="keyword"
                    :class="[
                      'px-3 py-1 rounded-full text-sm font-medium',
                      isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-50 text-blue-600'
                    ]"
                  >
                    {{ keyword }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 插件详细信息 -->
          <div class="mb-8">
            <h3 :class="[
              'text-xl font-semibold mb-3 flex items-center gap-2',
              isDarkMode ? 'text-white' : 'text-gray-800'
            ]">
              <Icon icon="mdi:cog" />
              技术信息
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div :class="[
                'rounded-xl p-4 border',
                isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              ]">
                <div :class="[
                  'text-sm mb-1 flex items-center gap-2',
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                ]">
                  <Icon icon="mdi:check-circle" />
                  状态
                </div>
                <div class="font-medium text-green-600 flex items-center gap-2">
                  <Icon icon="mdi:check" />
                  可用
                </div>
              </div>
              <div :class="[
                'rounded-xl p-4 border',
                isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              ]">
                <div :class="[
                  'text-sm mb-1 flex items-center gap-2',
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                ]">
                  <Icon icon="mdi:application-cog" />
                  兼容性
                </div>
                <div :class="[
                  'font-medium',
                  isDarkMode ? 'text-gray-200' : 'text-gray-800'
                ]">{{ selectedPlugin.minVersion }} - {{ selectedPlugin.maxVersion }}</div>
              </div>
              <div :class="[
                'rounded-xl p-4 border',
                isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              ]">
                <div :class="[
                  'text-sm mb-1 flex items-center gap-2',
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                ]">
                  <Icon icon="mdi:identifier" />
                  插件ID
                </div>
                <div :class="[
                  'font-medium font-mono text-sm',
                  isDarkMode ? 'text-gray-200' : 'text-gray-800'
                ]">{{ selectedPlugin.id }}</div>
              </div>
              <div v-if="selectedPlugin.homepageUrl" :class="[
                'rounded-xl p-4 border',
                isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              ]">
                <div :class="[
                  'text-sm mb-1 flex items-center gap-2',
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                ]">
                  <Icon icon="mdi:home" />
                  官方网站
                </div>
                <a 
                  :href="selectedPlugin.homepageUrl" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="font-medium text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1"
                >
                  访问网站
                  <Icon icon="mdi:open-in-new" class="text-xs" />
                </a>
              </div>
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="flex gap-4">
            <button 
              @click="goToRepository(selectedPlugin)"
              :disabled="!selectedPlugin.repositoryUrl || selectedPlugin.repositoryUrl.trim() === ''"
              :class="[
                'flex-1 px-6 py-3 rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200',
                selectedPlugin.repositoryUrl && selectedPlugin.repositoryUrl.trim() !== '' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white cursor-pointer' 
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              ]"
              :style="selectedPlugin.repositoryUrl && selectedPlugin.repositoryUrl.trim() !== '' ? 'background: linear-gradient(135deg, #4d9fff 0%, #6366f1 100%)' : ''"
              :title="selectedPlugin.repositoryUrl && selectedPlugin.repositoryUrl.trim() !== '' ? '查看仓库' : '暂无仓库链接'"
            >
              <Icon icon="mdi:github" class="inline mr-2" />
              Repo
            </button>
            <button 
              @click="closeModal"
              :class="[
                'flex-1 px-6 py-3 rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200',
                'bg-gradient-to-r from-blue-500 to-indigo-600 text-white cursor-pointer'
              ]"
              style="background: linear-gradient(135deg, #4d9fff 0%, #6366f1 100%)"
            >
              关闭
            </button>
          </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>

    <!-- 注意事项弹窗 -->
    <Transition name="modal-backdrop">
      <div v-if="showNotice" class="fixed inset-0 z-[9999] flex items-center justify-center"
           style="background-color: rgba(0, 0, 0, 0.5);">
        <!-- 毛玻璃遮罩 -->
        <div 
          class="fixed inset-0 backdrop-blur-sm"
          @click="closeNotice"
        ></div>

        <!-- 弹窗内容 -->
        <Transition name="modal-content" appear>
          <div v-if="showNotice" :class="[
            'relative rounded-3xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto transition-colors',
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          ]">

          <div class="p-8">
            <!-- 标题 -->
            <h2 :class="[
              'text-3xl font-bold mb-6',
              isDarkMode ? 'text-white' : 'text-gray-800'
            ]">⚠️ 插件市场重要提示</h2>

            <!-- 内容 -->
            <div class="space-y-6">
              <div>
                <h3 :class="[
                  'text-xl font-semibold mb-3 flex items-center gap-2',
                  isDarkMode ? 'text-white' : 'text-gray-800'
                ]">
                  <Icon icon="mdi:lock" /> 安全须知
                </h3>
                <p :class="[
                  'leading-relaxed text-base',
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                ]">所有插件均由第三方开发者独立开发，<strong>MaiBot项目团队不承担任何责任</strong>。</p>
              </div>

              <div>
                <h3 :class="[
                  'text-xl font-semibold mb-3 flex items-center gap-2',
                  isDarkMode ? 'text-white' : 'text-gray-800'
                ]">
                  <Icon icon="mdi:clipboard-text" /> 使用前必读
                </h3>
                <ul :class="[
                  'list-disc pl-6 space-y-2',
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                ]">
                  <li>⚠️ 第三方插件可能存在安全风险：恶意代码、隐私泄露、系统崩溃</li>
                  <li>⚠️ 插件质量无法保证：功能缺陷、兼容性问题、法律风险</li>
                  <li>⚠️ 使用风险完全自担：MaiBot团队不提供技术支持或售后服务</li>
                </ul>
              </div>

              <div>
                <h3 :class="[
                  'text-xl font-semibold mb-3 flex items-center gap-2',
                  isDarkMode ? 'text-white' : 'text-gray-800'
                ]">
                  <Icon icon="mdi:shield-check" /> 安全建议
                </h3>
                <ul :class="[
                  'list-disc pl-6 space-y-2',
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                ]">
                  <li>🔍 仔细评估插件来源和开发者信誉</li>
                  <li>📖 详细阅读插件说明和权限要求</li>
                  <li>🧪 测试环境中先试用再正式使用</li>
                  <li>🚫 立即停用发现异常行为的插件</li>
                </ul>
              </div>

              <div>
                <h3 :class="[
                  'text-xl font-semibold mb-3 flex items-center gap-2',
                  isDarkMode ? 'text-white' : 'text-gray-800'
                ]">
                  <Icon icon="mdi:phone" /> 问题处理
                </h3>
                <ul :class="[
                  'list-disc pl-6 space-y-2',
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                ]">
                  <li>插件技术问题：请直接联系插件开发者</li>
                  <li>违规举报：通过官方渠道举报恶意插件</li>
                  <li>平台问题：联系MaiBot官方支持</li>
                </ul>
              </div>

              <div>
                <p :class="[
                  'leading-relaxed text-sm',
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                ]">💡 继续使用即表示您已阅读并同意《<a href="./PLUGIN_MARKET_NOTICE.md" class="underline hover:text-blue-500 transition-colors" target="_blank">MaiBot插件市场使用公告</a>》的全部条款。</p>
              </div>

              <!-- 我已知悉复选框 -->
              <div class="flex items-center gap-2 mt-6">
                <input 
                  type="checkbox" 
                  v-model="dontShowNoticeAgain" 
                  :class="[
                    'w-5 h-5 rounded transition-colors',
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-100 border-gray-200 text-gray-600'
                  ]"
                />
                <label :class="[
                  'text-sm',
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                ]">我已知悉，下次不再提示</label>
              </div>
              
              <!-- 关闭按钮 -->
              <div class="flex justify-end mt-8">
                <button 
                  @click="closeNotice"
                  :disabled="!canCloseNotice"
                  :class="[
                    'px-8 py-3 rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200',
                    canCloseNotice
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white cursor-pointer'
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  ]"
                  :style="canCloseNotice ? 'background: linear-gradient(135deg, #4d9fff 0%, #6366f1 100%)' : ''"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>

    <!-- 底部 -->
    <footer :class="[
      'text-white py-8 transition-colors',
      isDarkMode ? 'bg-gray-900' : 'bg-gray-800'
    ]">
      <div class="container mx-auto px-4 text-center">
        <div class="flex items-center justify-center gap-3 mb-4">
          <Icon icon="mdi:puzzle" class="text-2xl" style="color: #4d9fff" />
          <span class="text-lg font-bold">插件仓库</span>
        </div>
        <p class="text-gray-400 text-sm mb-4">为您的 MaiBot 提供强大的插件支持</p>
        <div class="flex items-center justify-center gap-6 text-sm text-gray-400">
          <a href="https://github.com/MaiM-with-u/plugin-repo" target="_blank" class="hover:text-white transition-colors flex items-center gap-1">
            <Icon icon="mdi:github" />
            GitHub
          </a>
          <span>|</span>
          <span>© 2025 MaiBot Plugin Repository</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* 毛玻璃效果 */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}

/* 弹窗背景动画 */
.modal-backdrop-enter-active, .modal-backdrop-leave-active {
  transition: all 0.3s ease;
}

.modal-backdrop-enter-from, .modal-backdrop-leave-to {
  opacity: 0;
}

/* 弹窗内容动画 */
.modal-content-enter-active, .modal-content-leave-active {
  transition: all 0.3s ease;
}

.modal-content-enter-from, .modal-content-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* 卡片扫描动画 */
.plugin-card {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-card-sweep {
  animation: cardSweepReveal 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  animation-delay: var(--sweep-delay);
}

@keyframes cardSweepReveal {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.9);
    filter: blur(3px);
  }
  50% {
    opacity: 0.6;
    filter: blur(1px);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

/* 列表扫描动画 */
.plugin-list-item {
  opacity: 0;
  transform: translateX(-50px) scale(0.95);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-list-sweep {
  animation: listSweepReveal 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  animation-delay: var(--sweep-delay);
}

@keyframes listSweepReveal {
  0% {
    opacity: 0;
    transform: translateX(-50px) scale(0.95);
    filter: blur(2px);
  }
  60% {
    opacity: 0.8;
    filter: blur(0.5px);
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1);
    filter: blur(0);
  }
}

/* 加载动画 */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 文本截断 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* 按钮悬停效果 */
.btn-gradient {
  background: linear-gradient(135deg, #4d9fff 0%, #6366f1 100%);
  transition: all 0.3s ease;
}

.btn-gradient:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(77, 159, 255, 0.3);
}

/* 卡片悬停效果 */
.card-hover {
  transition: all 0.3s ease;
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

/* 渐变文本 */
.gradient-text {
  background: linear-gradient(135deg, #4d9fff 0%, #6366f1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeInUp {
  animation: fadeInUp 0.6s ease-out;
}

/* 背景动画 */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}
</style>
