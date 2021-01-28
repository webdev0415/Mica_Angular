# Uncomment this to have Agent run once (e.g. when running as an initContainer)
exit_after_auth = true
pid_file = "/home/vault/pidfile"

auto_auth {
    method "kubernetes" {
        mount_path = "auth/kubernetes-production"
        config = {
            role = "k8-role-production"
        }
    }

    sink "file" {
        config = {
            path = "/home/vault/.vault-token"
        }
    }
}
