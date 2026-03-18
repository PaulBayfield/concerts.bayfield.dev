FROM alpine:3.19 AS base

# Next.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Throw-away build stage to reduce size of final image
FROM base AS build

# Install packages needed to build node modules
RUN apk -U add build-base gyp pkgconfig python3 nodejs npm

# Install node modules
COPY --link package-lock.json package.json ./
RUN npm ci --include=dev --force

# Copy application code
COPY --link . .

# Build application
RUN npm run build

# Remove development dependencies
RUN npm prune --omit=dev --force

FROM base AS run

# Install node.js, python3, pip, ffmpeg, deno and yt-dlp
RUN apk add --no-cache nodejs python3 py3-pip ffmpeg curl unzip && \
    curl -fsSL https://deno.land/install.sh | sh && \
    ln -s /root/.deno/bin/deno /usr/local/bin/deno && \
    pip3 install --no-cache-dir --break-system-packages yt-dlp

# Copy standalone app
COPY --from=build /app/.next/standalone /app
COPY --from=build /app/.next/static /app/.next/static
COPY --from=build /app/public /app/public

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Run the app
CMD [ "node", "server.js" ]
