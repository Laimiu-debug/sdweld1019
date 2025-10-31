# 使用官方 Python 3.11 镜像
FROM python:3.11-slim

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    DEBIAN_FRONTEND=noninteractive

# 配置 APT 使用国内镜像源（阿里云镜像，速度更快更稳定）
RUN rm -f /etc/apt/sources.list.d/debian.sources && \
    echo "deb https://mirrors.aliyun.com/debian/ bookworm main contrib non-free non-free-firmware" > /etc/apt/sources.list && \
    echo "deb https://mirrors.aliyun.com/debian/ bookworm-updates main contrib non-free non-free-firmware" >> /etc/apt/sources.list && \
    echo "deb https://mirrors.aliyun.com/debian-security bookworm-security main contrib non-free non-free-firmware" >> /etc/apt/sources.list

# 配置 APT 加速选项
RUN echo 'Acquire::http::Timeout "30";' > /etc/apt/apt.conf.d/99timeout && \
    echo 'Acquire::ftp::Timeout "30";' >> /etc/apt/apt.conf.d/99timeout && \
    echo 'Acquire::Retries "3";' >> /etc/apt/apt.conf.d/99timeout && \
    echo 'APT::Get::Assume-Yes "true";' >> /etc/apt/apt.conf.d/99timeout && \
    echo 'APT::Install-Recommends "false";' >> /etc/apt/apt.conf.d/99timeout

# 安装系统依赖（使用国内镜像源，速度快）
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    libpq-dev \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# 复制依赖文件
COPY requirements.txt .

# 安装 Python 依赖（使用阿里云 PyPI 镜像加速）
RUN pip install --upgrade pip -i https://mirrors.aliyun.com/pypi/simple/ && \
    pip install --no-cache-dir -r requirements.txt \
    -i https://mirrors.aliyun.com/pypi/simple/ \
    --trusted-host mirrors.aliyun.com

# 复制应用代码
COPY . .

# 创建上传目录
RUN mkdir -p /app/storage/uploads

# 暴露端口
EXPOSE 8000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/health || exit 1

# 启动命令
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]

