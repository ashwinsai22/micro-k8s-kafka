FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY admin.js .

ENV NODE_ENV=production

CMD ["node", "admin.js"]
