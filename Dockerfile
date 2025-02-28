# Use Node.js base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install --production

# Copy all project files
COPY . .

# Build Next.js app
RUN npm run build

# Expose frontend port
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start"]
