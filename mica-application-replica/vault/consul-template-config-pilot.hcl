vault {
  renew_token = false
  vault_agent_token_file = "/home/vault/.vault-token"
  retry {
    backoff = "1s"
  }
}

template {
  destination = "/etc/secrets/env.txt"
  contents = <<EOH
{{- with secret "secret/GLOBAL" }}
HOST={{ .Data.data.WSGI_SERVICE_HOST }}
{{ end }}
EOH
}
