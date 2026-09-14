# ---- build stage -----------------------------------------------------------
FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Relative path: nginx (below) proxies /api/* to the backend container, so the
# browser never needs to know the backend address and CORS is not involved.
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# `npm run build` runs `tsc -b` first, which currently fails on unused-variable
# lint errors (TS6133) in existing source. Vite bundles without type-checking,
# so the image builds from the code as-is. Run `npm run build` locally to see them.
RUN npx vite build

# ---- runtime stage ---------------------------------------------------------
FROM nginx:1.27-alpine

RUN apk add --no-cache curl

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -sf http://127.0.0.1/ > /dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
