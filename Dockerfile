# Use official Node.js image
FROM node:18

# Install system dependencies (if needed)
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first (for better caching)
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies)
RUN npm install

# NOW set NODE_ENV to production
ENV NODE_ENV=production

# Copy all project files
COPY . .

# Run Tailwind CSS build (if applicable)
RUN npx tailwindcss -i ./src/app/globals.css -o ./public/output.css || true

# Build the Next.js frontend
RUN npm run build

# Expose frontend port
EXPOSE 3000

# Start the app using dumb-init
CMD ["dumb-init", "npm", "run", "start"]

# Healthcheck to ensure the app is running
HEALTHCHECK --interval=10s --timeout=2s --start-period=15s \
CMD curl -fs http://localhost:3000/api/health || exit 1
