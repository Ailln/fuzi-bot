FROM node:16.13.0-alpine as builder

WORKDIR /app/

COPY package*.json /app/

RUN npm install --registry=https://registry.npmmirror.com

COPY ./ /app/

# RUN npm run test:all
# RUN npm run fetch:blocks
RUN npm run build

FROM nginx:1.21.4-alpine as runner

WORKDIR /usr/share/nginx/html/

COPY ./deploy/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist  /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
