data "keycloak_openid_client" "realm_management" {
  realm_id  = keycloak_realm.realm.id
  client_id = "realm-management"
}

# ####################### #
# public  client Creation #
# ####################### #


resource "keycloak_openid_client" "client" {
  realm_id                        = keycloak_realm.realm.id
  client_id                       = "starter"
  access_type                     = "PUBLIC"
  direct_access_grants_enabled    = true
  standard_flow_enabled           = true
  root_url                        = var.root_url
  base_url                        = var.base_url
  valid_redirect_uris             = var.valid_redirect_uris
  valid_post_logout_redirect_uris = var.valid_post_logout_redirect_uris
  web_origins                     = var.web_origins
  access_token_lifespan           = "36000"
}

resource "keycloak_openid_client_default_scopes" "client_default_scopes" {
  realm_id  = keycloak_realm.realm.id
  client_id = keycloak_openid_client.client.id
  default_scopes = [
    "profile",
    "email",
    "roles",
    "web-origins",
    "openid",
    "basic"
  ]
}

resource "keycloak_openid_user_property_protocol_mapper" "user_id_mapper" {
  realm_id  = keycloak_realm.realm.id
  client_id = keycloak_openid_client.client.id
  name                  = "user-id-mapper"
  claim_name            = "user_id"
  user_property         = "id"
}

# ############################# #
# confidential  client Creation #
# ############################# #

resource "keycloak_openid_client" "admin_client" {
  realm_id                     = keycloak_realm.realm.id
  client_id                    = "admin_client"
  access_type                  = "CONFIDENTIAL"
  standard_flow_enabled        = false
  direct_access_grants_enabled = false
  # use api via token, rather than grant access
  service_accounts_enabled = true
  description              = "Client for realm management via API"
  access_token_lifespan    = 60
}

locals {
  required_service_roles = [
    "manage-clients",
    "manage-users",
    "view-realm",
  ]
}

resource "keycloak_openid_client_service_account_role" "client_service_account_role_manage_users" {
  for_each                = toset(local.required_service_roles)
  realm_id                = keycloak_realm.realm.id
  client_id               = data.keycloak_openid_client.realm_management.id
  service_account_user_id = keycloak_openid_client.admin_client.service_account_user_id
  role                    = each.key
}


## Blockchain connector section

resource "keycloak_openid_client" "blockchain" {
  realm_id                 = keycloak_realm.realm.id
  client_id                = "blockchain_connector"
  client_secret            = var.default_password
  access_type              = "CONFIDENTIAL"
  service_accounts_enabled = true
  description              = "Service account for the blockchain connector"
  access_token_lifespan    = 60
  full_scope_allowed       = false
}

resource "keycloak_openid_client_default_scopes" "blockchain" {
  realm_id       = keycloak_realm.realm.id
  client_id      = keycloak_openid_client.blockchain.id
  default_scopes = []
}

resource "keycloak_openid_client_optional_scopes" "blockchain" {
  realm_id        = keycloak_realm.realm.id
  client_id       = keycloak_openid_client.blockchain.id
  optional_scopes = []
}

resource "keycloak_openid_hardcoded_claim_protocol_mapper" "blockchain_party" {
  realm_id         = keycloak_realm.realm.id
  client_id        = keycloak_openid_client.blockchain.id
  name             = "Role"
  claim_name       = "role"
  claim_value_type = "JSON"
  claim_value      = "[\"blockchain_connector\"]"
}

resource "keycloak_openid_hardcoded_claim_protocol_mapper" "blockchain_role" {
  realm_id         = keycloak_realm.realm.id
  client_id        = keycloak_openid_client.blockchain.id
  name             = "Rights"
  claim_name       = "rights"
  claim_value_type = "JSON"
  claim_value      = "[\"blockchain_connector\"]"
}


## Node-RED section

resource "keycloak_openid_client" "nodered" {
  realm_id                 = keycloak_realm.realm.id
  client_id                = "nodered"
  client_secret            = var.default_password
  access_type              = "CONFIDENTIAL"
  service_accounts_enabled = true
  description              = "Service account for Node-RED"
  access_token_lifespan    = 60
  full_scope_allowed       = false
}

resource "keycloak_openid_client_default_scopes" "nodered" {
  realm_id       = keycloak_realm.realm.id
  client_id      = keycloak_openid_client.nodered.id
  default_scopes = []
}

resource "keycloak_openid_client_optional_scopes" "nodered" {
  realm_id        = keycloak_realm.realm.id
  client_id       = keycloak_openid_client.nodered.id
  optional_scopes = []
}

resource "keycloak_openid_hardcoded_claim_protocol_mapper" "nodered_party" {
  realm_id         = keycloak_realm.realm.id
  client_id        = keycloak_openid_client.nodered.id
  name             = "Role"
  claim_name       = "role"
  claim_value_type = "JSON"
  claim_value      = "[\"IoTDevice\"]"
}

resource "keycloak_openid_hardcoded_claim_protocol_mapper" "nodered_role" {
  realm_id         = keycloak_realm.realm.id
  client_id        = keycloak_openid_client.nodered.id
  name             = "Rights"
  claim_name       = "rights"
  claim_value_type = "JSON"
  claim_value      = "[\"IoTDevice\"]"
}
