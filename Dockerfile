FROM node:22-slim

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy application source and build the Vite frontend
COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["npm", "start"]
