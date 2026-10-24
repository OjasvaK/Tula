FROM node:lts-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# Vite bakes VITE_* vars into the build at build time, not at container
# runtime - so this has to be a build ARG, not a docker-compose environment
# var. It's the URL the *browser* will call, so it must be reachable from
# the host (e.g. http://localhost:8000), not the internal Docker service
# name ("backend") which only resolves inside the compose network.
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
