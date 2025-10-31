# 构建阶段
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建参数
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# 构建应用
RUN npm run build

# 生产阶段 - 只保留构建产物
FROM nginx:alpine

# 从构建阶段复制构建产物
COPY --from=builder /app/dist /app/dist

# 暴露端口（虽然不直接使用，但保留用于文档）
EXPOSE 80

# Nginx 会由主 nginx 容器管理，这里只是构建产物容器
CMD ["echo", "Admin portal build completed"]

