# Stage 1: build the React app
FROM node:22-alpine as build

WORKDIR /frontend

COPY package.json .
COPY tsconfig.json .
COPY vite.config.ts .
COPY index.html ./
COPY src ./src

RUN npm install --prefer-offline --no-audit --progress=false && \
    npm run build

# Stage 2: serve the built static files
FROM nginx:alpine

COPY --from=build /frontend/dist /usr/share/nginx/html

# Copy custom nginx configuration to proxy API requests to backend
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]