#################### BUILD STAGE ####################
FROM node:20-alpine AS build

# Set working directory
WORKDIR /usr/src/app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm ci --ignore-scripts

# Copy only the necessary application files
COPY src ./src
COPY public ./public
COPY angular.json ./
COPY tsconfig*.json ./
COPY eslint.config.js ./
COPY .stylelintrc.json ./
COPY ngsw-config.json ./
COPY jest.config.ts ./
COPY jest.setup.ts ./

# Build Angular application in production mode
RUN npm run build --prod

#################### TESTING STAGE ####################
FROM node:20-alpine AS test

WORKDIR /usr/src/app

# Copy everything from build (source, config, node_modules, etc.)
COPY --from=build /usr/src/app /usr/src/app

# Optional: uncomment to run tests
# RUN npm run test

#################### PRODUCTION STAGE ####################
FROM nginx:alpine

# Set working directory
WORKDIR /usr/share/nginx/html

# Remove default Nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy built Angular app from build stage
COPY --from=build /usr/src/app/dist/research-indicators/browser /usr/share/nginx/html

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Set ownership and secure permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && chmod -R 755 /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Run as non-root user for better security
USER nginx

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
