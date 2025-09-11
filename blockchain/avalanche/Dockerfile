FROM node:22-alpine

COPY . /usr/src/app
WORKDIR /usr/src/app

RUN npm install

ENTRYPOINT ["/bin/sh"]
CMD ["-c", "npx hardhat node"]
