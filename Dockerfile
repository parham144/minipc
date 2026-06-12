# Stage 1: Build the full-stack application
FROM node:20-alpine AS builder
WORKDIR /app

# Enable npm caching for faster installs
COPY package*.json ./
RUN npm ci

# Copy the source files
COPY . .

# Build the React frontend with Vite and bundle the Express server with esbuild
RUN npm run build

# Prune development packages
RUN npm prune --production

# Stage 2: Minimal runtime image
FROM node:20-alpine
WORKDIR /app

# Copy package and node_modules for CJS runtime
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Expose port 3000 as mandated by AI Studio configuration in nginx proxy
EXPOSE 3000

# Set production context
ENV NODE_ENV=production

# Boot Express integration backend
CMD ["npm", "start"]
