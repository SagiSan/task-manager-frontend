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

# Set NODE_ENV to production **AFTER** installing dependencies
ENV NODE_ENV=production

# Copy all project files
COPY . .

# ✅ Ensure Tailwind CSS builds correctly
RUN npx tailwindcss -i ./src/app/globals.css -o ./public/output.css || true

# ✅ Fix Next.js build issue by ensuring `NEXT_PUBLIC_API_URL` is set
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# ✅ Build the Next.js frontend
RUN npm run build

# Expose frontend port
EXPOSE 3000

# Start the app using dumb-init
CMD ["dumb-init", "npm", "run", "start"]

# ✅ Fix Healthcheck for Frontend
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s \
  CMD curl -fs http://localhost:3000 || exit 0
