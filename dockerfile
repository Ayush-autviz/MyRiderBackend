# Base image
FROM node:18

# Set working directory inside container
WORKDIR /usr/src/app

# Copy package files first for layer caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all remaining files
COPY . .

# Expose the app port
EXPOSE 3000

# Command to run the app
CMD ["node", "index.js"]
