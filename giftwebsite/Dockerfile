# Use Node.js LTS version
FROM node:18-slim

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code (index.js and the React build)
COPY . .

# Expose port
EXPOSE 9000

# Run the application
CMD ["node", "index.js"]
