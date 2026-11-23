/** @type {import('tailwindcss').Config} */
// Tailwind 预编译配置（P0-2 优化）
// 扫描 index.html / thinking-toolbox.html / agreements.html 生成实际用到的 CSS 类
// 输出到 assets/css/tailwind.min.css，替代原 CDN 阻塞脚本
module.exports = {
  content: [
    './index.html',
    './thinking-toolbox.html',
    './agreements.html'
  ],
  // 显式声明必须生成的类（防止扫描器在长行/复杂字符串中漏检）
  safelist: [
    'bg-paper/95',
    'bg-paper-2',
    'text-ink',
    'text-seal',
    'bg-ink',
    'bg-paper',
    'bg-seal',
    'border-ink',
    'border-line',
    'border-seal',
    'stroke-line',
    'text-gray-soft'
  ],
  theme: {
    extend: {
      colors: {
        ink: '#1a1a1a',
        paper: {
          DEFAULT: '#f8f5ef',
          2: '#f2ede2'
        },
        seal: '#a8362a',
        line: '#e6e0d5',
        'gray-soft': '#6b6b6b'
      }
    }
  },
  plugins: []
};
