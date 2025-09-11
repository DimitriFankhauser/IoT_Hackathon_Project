FROM hashicorp/terraform:latest

WORKDIR /terraform
COPY *.tf /terraform/
COPY *.sh /usr/local/bin
VOLUME /state

RUN terraform init
ENTRYPOINT []
CMD ["local.sh"]
