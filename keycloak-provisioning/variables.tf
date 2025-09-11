variable "default_admin_user" {
  type = string
  default = "admin"
}

variable "default_password" {
  type = string
}

variable "root_url" {
  type    = string
  default = "http://localhost:3000"
}

variable "base_url" {
  type    = string
  default = "http://localhost:3000"
}

variable "valid_redirect_uris" {
  type    = list(string)
  default = ["*"]
}

variable "valid_post_logout_redirect_uris" {
  type    = list(string)
  default = ["+"]
}

variable "web_origins" {
  type    = list(string)
  default = ["*"]
}

variable "realm_smtp_from" {
  type    = string
  default = "payee1@noumenadigital.com"
}

variable "realm_smtp_host" {
  type    = string
  default = "smtp.gmail.com"
}

variable "realm_smtp_port" {
  type    = number
  default = 465
}

variable "realm_smtp_auth_username" {
  type    = string
  default = "payee1@noumenadigital.com"
}

variable "realm_smtp_auth_password" {
  type    = string
  default = ""
}

variable "application_name" {
  type        = string
  default     = "starter"
  description = "Application name, used to construct unique secrets, by using it as part of the name"
}

variable "enable_otp_master" {
  type        = bool
  default     = false
  description = "enable OTP for master realm (new and existing users)"
}

variable "enable_otp_starter" {
  type        = bool
  default     = false
  description = "enable OTP for seed realm (new and existing users)"
}

variable "keycloak_url" {
  type        = string
  description = "keycloak url for provider"
}

variable "keycloak_login_timeout" {
  type        = string
  default     = "30m"
  description = "The maximum amount of time a user is permitted to stay on the login page before the authentication process must be restarted."
}
