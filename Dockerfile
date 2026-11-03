FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY server.js ./
COPY EDUC_CI_v1.0.0.apk ./
EXPOSE 10000
CMD ["node", "server.js"]
