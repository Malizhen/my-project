#!/bin/bash

# 记账本应用 - 本地验证指南

echo "============================================"
echo "  记账本应用 - 本地验证"
echo "============================================"
echo ""

echo "方式一：使用演示版（最简单，推荐）"
echo "-------------------------------------------"
echo "已创建单文件演示版: demo.html"
echo ""
echo "直接在浏览器中打开即可："
echo "  file:///data/workspace/my-project/demo.html"
echo ""
echo "或者复制到本地电脑，双击打开"
echo ""

echo "方式二：使用Python简易服务器"
echo "-------------------------------------------"
echo "如果系统有Python，可以运行："
echo "  cd /data/workspace/my-project"
echo "  python3 -m http.server 8000"
echo ""
echo "然后访问: http://localhost:8000/demo.html"
echo ""

echo "方式三：完整React项目（需要Node.js）"
echo "-------------------------------------------"
echo "1. 安装 Node.js (https://nodejs.org/)"
echo "2. cd /data/workspace/my-project"
echo "3. npm install"
echo "4. npm run dev"
echo "5. 访问 http://localhost:3000"
echo ""

echo "============================================"
echo "正在尝试启动演示..."
echo "============================================"

# 检查Python
if command -v python3 &> /dev/null; then
    echo ""
    echo "✓ 检测到 Python3"
    echo "正在启动HTTP服务器..."
    cd /data/workspace/my-project
    echo ""
    echo "服务器启动成功！"
    echo "请在浏览器中访问: http://localhost:8000/demo.html"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo ""
    python3 -m http.server 8000
else
    echo ""
    echo "⚠ 未检测到 Python"
    echo ""
    echo "请手动打开文件："
    echo "  /data/workspace/my-project/demo.html"
    echo ""
    echo "或将文件复制到本地电脑，双击打开"
fi
