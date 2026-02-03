{
  description = "Entorno de desarrollo para Swipe-pad";

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
            # corepack para tener pnpm/yarn si los necesitas
            corepack_22
            # git por si acaso no está en el path
            git
          ];

          shellHook = ''
            echo "🚀 Entorno de desarrollo de Swipe-pad cargado"
            echo "📦 Node.js: $(node --version)"
            echo "🍞 Bun: $(bun --version)"
            echo "🛠️  Usa 'bun dev' para empezar"
          '';
        };
      });
}
