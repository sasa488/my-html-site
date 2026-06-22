FROM node:22-alpine

WORKDIR /app
RUN apk add --no-cache poppler-utils
COPY package.json server.mjs ./
COPY data ./data
COPY lib ./lib
COPY public ./public
COPY scripts ./scripts

ENV NODE_ENV=production
ENV PORT=7860
EXPOSE 7860

CMD ["node", "server.mjs"]
