// 主题切换功能
document.addEventListener('DOMContentLoaded', function() {
  // 获取所有主题切换按钮
  const themeButtons = document.querySelectorAll('[data-set-theme]');
  
  // 为每个按钮添加点击事件
  themeButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const theme = this.getAttribute('data-set-theme');
      
      // 设置主题到HTML根元素
      document.documentElement.setAttribute('data-theme', theme);
      
      // 保存主题到localStorage
      localStorage.setItem('theme', theme);
      
      // 关闭下拉菜单
      document.activeElement.blur();
    });
  });
  
  // 页面加载时应用保存的主题
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else {
    // 默认主题
    document.documentElement.setAttribute('data-theme', 'light');
  }
});
