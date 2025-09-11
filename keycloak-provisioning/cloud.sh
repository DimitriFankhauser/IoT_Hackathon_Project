#!/bin/sh
set -e

export CONSUL_ADDRESS=${CONSUL_ADDRESS?: "CONSUL_ADDRESS has not been set"}
export SCHEME=${SCHEME?: "SCHEME has not been set"}

export KEYCLOAK_USER=${KEYCLOAK_USER?: "KEYCLOAK_USER has not been set" }
export KEYCLOAK_PASSWORD=${KEYCLOAK_PASSWORD?: "KEYCLOAK_PASSWORD has not been set" }
export KEYCLOAK_URL=${KEYCLOAK_URL?: "KEYCLOAK_URL has not been set" }
export TF_VAR_default_password=${TF_VAR_default_password?: "TF_VAR_default_password has not been set"}
export TF_VAR_application_name=${TF_VAR_application_name?: "TF_VAR_application_name has not been set"}

cat > /terraform/backend.tf <<EOT
terraform {
  backend "consul" {
    address="$CONSUL_ADDRESS"
    path="terraform/keycloak-$TF_VAR_application_name"
    scheme="$SCHEME"
    ca_file="/secrets/ca.crt"
    cert_file="/secrets/client.crt"
    key_file="/secrets/client.key"
  }
}
EOT

env

terraform init
terraform apply -auto-approve
