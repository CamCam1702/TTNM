FROM node:16-alpine

# Set working directory
WORKDIR /app

# Copy package.json và yarn.lock trước
COPY package.json yarn.lock ./

# Cài đặt dependencies
RUN yarn install --frozen-lockfile


# Copy toàn bộ mã nguồn
COPY . .

# Build ứng dụng Next.js
RUN yarn build

# Expose cổng mà ứng dụng sử dụng (ví dụ: 3000)
EXPOSE 3000

# Chạy ứng dụng
CMD ["yarn", "start"]
