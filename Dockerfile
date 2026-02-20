# Use lightweight Node image
FROM node:18-alpine

# Create app directory inside container
WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy remaining project files
COPY . .

# Expose app port
EXPOSE 3002

# Start the application
CMD ["node", "index.js"]

