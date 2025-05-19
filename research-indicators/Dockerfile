#################### BUILD STAGE ####################
FROM node:20-alpine AS build

# Set working directory
WORKDIR /usr/src/app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application source code
COPY . .

# Build Angular application in production mode
RUN npm run build --prod

#################### TESTING STAGE ####################
FROM node:20-alpine AS test

# Set working directory
WORKDIR /usr/src/app

# Copy built app (including source, node_modules, etc.)
COPY --from=build /usr/src/app /usr/src/app

# Optional: run tests if needed
# RUN npm run test

#################### PRODUCTION STAGE ####################
FROM nginx:alpine

# Set working directory
WORKDIR /usr/share/nginx/html

# Remove default Nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built Angular app from build stage
COPY --from=build /usr/src/app/dist/research-indicators/browser /usr/share/nginx/html

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Set ownership and permissions for nginx user
RUN chown -R nginx:nginx /usr/share/nginx/html && chmod -R 755 /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Switch to non-root user (Sonar recommendation)
USER nginx

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
