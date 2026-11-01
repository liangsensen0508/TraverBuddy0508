#!/usr/bin/env bash
# 前端改动后的一键构建脚本（同源部署用）
# 作用：构建前端 -> 把产物复制到 backend/public，供后端一起提供
# 用法：在项目根目录执行  bash deploy.sh
# 说明：只改了后端代码时不需要执行本脚本，直接让助手重新发布 backend 目录即可

set -e

echo "1/2 构建前端..."
cd frontend
npm run build

echo "2/2 复制构建产物到 backend/public..."
cd ..
rm -rf backend/public
mkdir -p backend/public
cp -r frontend/dist/. backend/public/

echo "完成：frontend/dist 已同步到 backend/public"
echo "下一步：让助手重新发布 backend 目录（会复用同一个线上链接）"
