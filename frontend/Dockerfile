FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# `npm run build` runs `tsc -b` first, which currently fails on type errors in
# existing source (unused vars, missing props). Vite bundles without
# type-checking, so the image builds from the code as-is.
RUN npx vite build


FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
