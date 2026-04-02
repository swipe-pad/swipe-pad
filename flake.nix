{
  description = "Development environment for Swipe-pad";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            bun
            sops
            age
            gitleaks
          ];

          shellHook = ''
            echo ""
            echo "┌─────────────────────────────────────────────────┐"
            echo "│  🚀 Swipe-pad dev env loaded                    │"
            echo "├─────────────────────────────────────────────────┤"
            printf "│  🍞 Bun: %-38s │\n" "$(bun --version)"
            echo "│  🛠️  Use 'bun dev' to start                      │"
            echo "└─────────────────────────────────────────────────┘"
            echo ""
          '';
        };
      });
}
