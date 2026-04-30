{
  description = "Development environment for Swipe-pad";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      nixpkgs,
      flake-utils,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };
        gha-local = pkgs.writeShellApplication {
          name = "gha-local";
          runtimeInputs = with pkgs; [
            act
            coreutils
            podman
          ];
          text = ''
            if [ -z "''${XDG_RUNTIME_DIR:-}" ]; then
              echo "XDG_RUNTIME_DIR is required for rootless Podman" >&2
              exit 1
            fi

            mkdir -p .cache/actions/artifacts .cache/actions/podman
            touch .cache/actions/env .cache/actions/input .cache/actions/secrets .cache/actions/vars

            export DOCKER_HOST="''${DOCKER_HOST:-unix://$XDG_RUNTIME_DIR/podman/podman.sock}"
            socket_path="''${DOCKER_HOST#unix://}"
            podman_service_pid=""

            if [ ! -S "$socket_path" ]; then
              mkdir -p "$(dirname "$socket_path")"
              podman system service --time=0 "$DOCKER_HOST" > .cache/actions/podman/service.log 2>&1 &
              podman_service_pid="$!"
              trap 'if [ -n "$podman_service_pid" ]; then kill "$podman_service_pid" 2>/dev/null || true; fi' EXIT

              for _ in $(seq 1 50); do
                [ -S "$socket_path" ] && break
                sleep 0.1
              done
            fi

            if [ ! -S "$socket_path" ]; then
              echo "Podman socket not available at $socket_path" >&2
              echo "Log: .cache/actions/podman/service.log" >&2
              exit 1
            fi

            exec act \
              -P ubuntu-latest=catthehacker/ubuntu:act-latest \
              --artifact-server-addr 127.0.0.1 \
              --artifact-server-port 0 \
              --artifact-server-path .cache/actions/artifacts \
              --cache-server-addr 127.0.0.1 \
              --cache-server-port 0 \
              --env-file .cache/actions/env \
              --input-file .cache/actions/input \
              --secret-file .cache/actions/secrets \
              --var-file .cache/actions/vars \
              "$@"
          '';
        };
      in
      {
        packages.gha-local = gha-local;

        apps.gha-local = {
          type = "app";
          program = "${gha-local}/bin/gha-local";
        };

        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            bun
            gh
            sops
            age
            gitleaks
            nixd
          ];

          shellHook = ''
            echo ""
            echo "┌─────────────────────────────────────────────────┐"
            echo "│  🚀 Swipe-pad dev env loaded                    │"
            echo "├─────────────────────────────────────────────────┤"
            printf "│  🍞 Bun: %-38s │\n" "$(bun --version)"
            printf "│  🔧 nixd: %-36s │\n" "$(nixd --version 2>/dev/null || echo 'not found')"
            echo "│  🛠️  Use 'bun dev' to start                      │"
            echo "└─────────────────────────────────────────────────┘"
            echo ""
          '';
        };

        devShells.actions = pkgs.mkShell {
          buildInputs = with pkgs; [
            act
            actionlint
            bun
            gh
            podman
          ];

          shellHook = ''
            echo "GitHub Actions sandbox: use 'nix run .#gha-local -- -W .github/workflows/ci.yml -j checks'"
          '';
        };
      }
    );
}
