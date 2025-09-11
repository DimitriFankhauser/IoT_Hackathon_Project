locals {
  password_policy_value = "length(14) and maxLength(128) and notEmail(undefined) and notUsername(undefined) and passwordHistory(0) and passwordBlacklist(password_blacklist.txt) and maxAuthAge(0)"
}

import {
  id = "master"
  to = keycloak_realm.master
}

resource "keycloak_realm" "master" {
  realm             = data.keycloak_realm.master.id
  display_name      = "Keycloak"
  display_name_html = "<div class=\"kc-logo-text\"><span>Keycloak</span></div>"
  ssl_required = "none"
  default_signature_algorithm = "RS256"

  login_with_email_allowed   = true
  password_policy            = local.password_policy_value
  access_code_lifespan_login = var.keycloak_login_timeout
  security_defenses {
    brute_force_detection {
      permanent_lockout                = false
      max_login_failures               = 5
      wait_increment_seconds           = 900
      quick_login_check_milli_seconds  = 1000
      minimum_quick_login_wait_seconds = 900
      max_failure_wait_seconds         = 900
      failure_reset_time_seconds       = 900
    }
  }
}

resource "keycloak_realm_events" "master_realm_events" {
  realm_id = keycloak_realm.master.id

  events_enabled    = true
  events_expiration = 0 # 0 is never

  admin_events_enabled         = true
  admin_events_details_enabled = true

  enabled_event_types = [] # [] is everything

  events_listeners = [
    "jboss-logging", # keycloak enables the 'jboss-logging' event listener by default.
  ]
}

# #################### #
#     Realm Creation   #
# #################### #

resource "keycloak_realm" "realm" {
  realm = "starter"
  ssl_required = "none"
  display_name = " "
  # Realm Settings > Login tab
  reset_password_allowed     = true
  login_with_email_allowed   = true
  password_policy            = local.password_policy_value
  access_code_lifespan_login = var.keycloak_login_timeout
  registration_email_as_username = true

  attributes = {}

  # Realm Settings > Email tab
  smtp_server {
    from = var.realm_smtp_from
    host = var.realm_smtp_host
    port = var.realm_smtp_port
    ssl  = true

    auth {
      username = var.realm_smtp_auth_username
      password = var.realm_smtp_auth_password
    }
  }
  security_defenses {
    brute_force_detection {
      permanent_lockout                = false
      max_login_failures               = 5
      wait_increment_seconds           = 900
      quick_login_check_milli_seconds  = 1000
      minimum_quick_login_wait_seconds = 900
      max_failure_wait_seconds         = 900
      failure_reset_time_seconds       = 900
    }
  }
}

resource "keycloak_realm_events" "realm_events" {
  realm_id = keycloak_realm.realm.id

  events_enabled    = true
  events_expiration = 0 # 0 is never

  admin_events_enabled         = true
  admin_events_details_enabled = true

  enabled_event_types = [] # [] is everything

  events_listeners = [
    "jboss-logging", # keycloak enables the 'jboss-logging' event listener by default.
  ]
}

# #################### #
#     enable OTP       #
# #################### #

# enable OTP for new users in seed realm (by default: disabled) to enable set variable: enable_otp_seed to true
resource "keycloak_required_action" "configure_totp_starter" {
  count          = var.enable_otp_starter ? 1 : 0
  realm_id       = keycloak_realm.realm.id
  alias          = "CONFIGURE_TOTP"
  name           = "Configure OTP"
  enabled        = true
  default_action = true
  priority       = 10
}

# enable OTP for new users in master realm (by default: disabled) to enable set variable: enable_otp_master to true
resource "keycloak_required_action" "configure_totp_master" {
  count          = var.enable_otp_master ? 1 : 0
  realm_id       = data.keycloak_realm.master.id
  alias          = "CONFIGURE_TOTP"
  name           = "Configure OTP"
  enabled        = true
  default_action = true
  priority       = 10
}
