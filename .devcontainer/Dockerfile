# Use the official Microsoft devcontainer for Node.js 20
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-20

# Install ffmpeg for video processing
RUN apt-get update \
  && apt-get install -y ffmpeg \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace