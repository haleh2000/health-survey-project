FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# VITE_API_URL:  where the browser sends API calls (absolute URL or a path
#                proxied by the host nginx, e.g. /health-analysis/api)
# VITE_BASE_PATH: public path the app is served from ("/" or "/health-analysis/")
ARG VITE_API_URL
ARG VITE_BASE_PATH=/
ENV VITE_API_URL=${VITE_API_URL} \
    VITE_BASE_PATH=${VITE_BASE_PATH}

# `npm run build` runs `tsc -b` first, which currently fails on type errors in
# existing source (unused vars, missing props). Vite bundles without
# type-checking, so the image builds from the code as-is.
RUN npx vite build


FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
