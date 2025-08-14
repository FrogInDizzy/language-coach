export default function TestStyles() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-8">
          🎉 Tailwind CSS 测试页面
        </h1>
        
        {/* 测试基础样式 */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">基础样式测试</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-100 text-red-800 p-4 rounded-xl">红色卡片</div>
            <div className="bg-green-100 text-green-800 p-4 rounded-xl">绿色卡片</div>
            <div className="bg-blue-100 text-blue-800 p-4 rounded-xl">蓝色卡片</div>
          </div>
        </div>

        {/* 测试按钮样式 */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">按钮样式测试</h2>
          <div className="flex flex-wrap gap-4">
            <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium transition-colors">
              绿色按钮
            </button>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors">
              蓝色按钮
            </button>
            <button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-colors">
              紫色按钮
            </button>
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl font-medium transition-colors">
              灰色按钮
            </button>
          </div>
        </div>

        {/* 测试渐变和阴影 */}
        <div className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-2xl p-8 text-white shadow-2xl">
          <h2 className="text-2xl font-semibold mb-4">渐变背景测试</h2>
          <p className="text-purple-100">如果你能看到这个美丽的渐变背景和阴影，说明 Tailwind CSS 正在正常工作！</p>
        </div>

        {/* 测试响应式 */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">响应式测试</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-yellow-100 text-yellow-800 p-4 rounded-xl text-center">1列 (移动端)</div>
            <div className="bg-orange-100 text-orange-800 p-4 rounded-xl text-center">2列 (平板)</div>
            <div className="bg-pink-100 text-pink-800 p-4 rounded-xl text-center">4列 (桌面)</div>
            <div className="bg-indigo-100 text-indigo-800 p-4 rounded-xl text-center">响应式</div>
          </div>
        </div>

        {/* 结果显示 */}
        <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-r-xl">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-3">
              <p className="text-green-700 font-semibold">
                如果你能看到上面所有的样式效果，说明 Tailwind CSS v4 已经成功配置并运行！
              </p>
              <p className="text-green-600 text-sm mt-1">
                现在可以删除这个测试页面，回到正常开发。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}