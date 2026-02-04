{
  description = "Development environment for Swipe-pad";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_22
            bun
            # corepack to have pnpm/yarn if needed
            corepack_22
            # git in case it is not in the path
            git
          ];

          shellHook = ''
            echo "🚀 Swipe-pad development environment loaded"
            echo "📦 Node.js: $(node --version)"
            echo "🍞 Bun: $(bun --version)"
            echo "🛠️  Use 'bun dev' to start"
          '';
        };
      });
}
