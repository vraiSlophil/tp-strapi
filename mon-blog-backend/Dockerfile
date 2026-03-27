FROM node:24-bookworm

WORKDIR /app

COPY package*.json ./
RUN npm install --no-fund --no-audit

COPY . .

EXPOSE 1337 5173

CMD ["npm", "run", "develop", "--", "--polling", "--no-open"]
