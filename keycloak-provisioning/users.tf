# ##################### #
# users Roles Creation #
# ##################### #
locals {
  required_actions_master = var.enable_otp_master ? [keycloak_required_action.configure_totp_master[0].alias] : []
  required_actions_starter   = var.enable_otp_starter ? [keycloak_required_action.configure_totp_starter[0].alias] : []
}

data "keycloak_realm" "master" {
  realm = "master"
}

data "keycloak_user" "default_admin_user" {
  realm_id = data.keycloak_realm.master.id
  username = var.default_admin_user
}

import {
  id = "${data.keycloak_realm.master.id}/${data.keycloak_user.default_admin_user.id}"
  to = keycloak_user.admin
}

resource "keycloak_default_roles" "default_roles" {
  realm_id      = keycloak_realm.realm.id
  default_roles = ["offline_access", "uma_authorization"]
}

resource "keycloak_role" "issuer_role" {
  realm_id    = keycloak_realm.realm.id
  name        = "issuer"
  description = "Issuer of the product"
}

resource "keycloak_role" "operator_role" {
  realm_id    = keycloak_realm.realm.id
  name        = "operator"
  description = "Operator of the system"
}

#  mapping the realm roles
resource "keycloak_openid_user_realm_role_protocol_mapper" "user_realm_role_mapper" {
  realm_id  = keycloak_realm.realm.id
  client_id = keycloak_openid_client.client.id
  name      = "realm roles"

  claim_name  = "party"
  multivalued = true
}

resource "keycloak_openid_user_attribute_protocol_mapper" "role_mapper" {
  realm_id   = keycloak_realm.realm.id
  client_id = keycloak_openid_client.client.id
  name      = "role attribute mapper"

  user_attribute   = "role"
  claim_name       = "role"
  claim_value_type = "JSON"
}

# ##################### #
#     user Profile      #
# ##################### #

resource "keycloak_realm_user_profile" "userprofile" {
  realm_id = keycloak_realm.realm.id

  attribute {
    name         = "username"
    display_name = "Username"
  }

  attribute {
    name         = "firstName"
    display_name = "First Name"

    /*
     * Allows the user and admin roles to view and edit the first name attribute
     */
    permissions {
      view = ["user", "admin"]
      edit = ["user", "admin"]
    }
  }

  attribute {
    name         = "lastName"
    display_name = "Last Name"

    permissions {
      view = ["user", "admin"]
      edit = ["user", "admin"]
    }
  }

  /*
   * Allows the admin roles only to edit the email attribute
   * Allows both the user and admin roles to view the email attribute
   */
  attribute {
    name = "email"

    permissions {
      view = ["admin", "user"]
      edit = ["admin"]
    }
  }

  /*
   * Allows the admin roles only to view and edit the email attribute
   * Attributes will be included in the JWT if a corresponding mapper is specified as above
   */
  attribute {
    name         = "role"
    display_name = "role"

    permissions {
      view = ["admin"]
      edit = ["admin"]
    }
  }
}

# ##################### #
#    users Creation     #
# ##################### #

resource "keycloak_user" "jane_issuer" {
  realm_id   = keycloak_realm.realm.id
  depends_on = [keycloak_realm_user_profile.userprofile]
  username   = "jane.issuer"
  email      = "jane@issuer.com"
  first_name = "Jane"
  last_name  = "Issuer"
  initial_password {
    value     = var.default_password
    temporary = false
  }
  required_actions = local.required_actions_starter
}

resource "keycloak_user" "joe_operator" {
  realm_id   = keycloak_realm.realm.id
  depends_on = [keycloak_realm_user_profile.userprofile]
  username   = "joe.operator"
  email      = "joe@operator.com"
  first_name = "Joe"
  last_name  = "Operator"
  initial_password {
    value     = var.default_password
    temporary = false
  }
  required_actions = local.required_actions_starter
}

resource "keycloak_user" "alice_device_manager" {
  realm_id   = keycloak_realm.realm.id
  depends_on = [keycloak_realm_user_profile.userprofile]
  username   = "alice"
  email      = "alice@example.com"
  first_name = "Alice"
  last_name  = "Device"
  attributes = {
    "role" = jsonencode(["deviceManager"])
  }
  initial_password {
    value     = var.default_password
    temporary = false
  }
  required_actions = local.required_actions_starter
}

resource "keycloak_user" "bob_device_manager" {
  realm_id   = keycloak_realm.realm.id
  depends_on = [keycloak_realm_user_profile.userprofile]
  username   = "bob"
  email      = "bob@example.com"
  first_name = "Bob"
  last_name  = "Device"
  attributes = {
    "role" = jsonencode(["deviceManager"])
  }
  initial_password {
    value     = var.default_password
    temporary = false
  }
  required_actions = local.required_actions_starter
}

resource "keycloak_user" "charlie_device_manager" {
  realm_id   = keycloak_realm.realm.id
  depends_on = [keycloak_realm_user_profile.userprofile]
  username   = "charlie"
  email      = "charlie@example.com"
  first_name = "Charlie"
  last_name  = "Device"
  attributes = {
    "role" = jsonencode(["deviceManager"])
  }
  initial_password {
    value     = var.default_password
    temporary = false
  }
  required_actions = local.required_actions_starter
}

resource "keycloak_user" "iot_device" {
  realm_id   = keycloak_realm.realm.id
  depends_on = [keycloak_realm_user_profile.userprofile]
  username   = "iot"
  email      = "iot@example.com"
  first_name = "IoT"
  last_name  = "Device"
  attributes = {
    "role" = jsonencode(["IoTDevice"])
  }
  initial_password {
    value     = var.default_password
    temporary = false
  }
  required_actions = local.required_actions_starter
}

resource "keycloak_user" "price_maker" {
  realm_id   = keycloak_realm.realm.id
  depends_on = [keycloak_realm_user_profile.userprofile]
  username   = "pricemaker"
  email      = "pricemaker@example.com"
  first_name = "Price"
  last_name  = "Maker"
  attributes = {
    "role" = jsonencode(["priceMaker"])
  }
  initial_password {
    value     = var.default_password
    temporary = false
  }
  required_actions = local.required_actions_starter
}

# ##################### #
#    Roles binding      #
# ##################### #

resource "keycloak_user_roles" "jane_issuer_roles" {
  realm_id = keycloak_realm.realm.id
  user_id  = keycloak_user.jane_issuer.id

  role_ids = [
    keycloak_role.issuer_role.id
  ]
}

resource "keycloak_user_roles" "joe_operator_roles" {
  realm_id = keycloak_realm.realm.id
  user_id  = keycloak_user.joe_operator.id

  role_ids = [
    keycloak_role.operator_role.id
  ]
}

# ################################ #
#    default admin user update     #
# ################################ #

resource "keycloak_user" "admin" {
  realm_id         = data.keycloak_realm.master.id
  username         = var.default_admin_user
  required_actions = local.required_actions_master
}
