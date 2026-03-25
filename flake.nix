{
  description = "Development environment for Swipe-pad";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        nixpkgsConfig = {
          allowUnfree = false;
          allowBroken = false;
          permitInsecurePackages = [ ];
          strictDepsByDefault = true;
          checkMeta = true;
          contentAddressedByDefault = true;
        };

        pkgs = import nixpkgs {
          inherit system;
          config = nixpkgsConfig;
        };

        playwrightLibs = with pkgs; [
          glib
          nspr
          nss
          dbus
          atk
          at-spi2-atk
          at-spi2-core
          expat
          alsa-lib
          udev
          mesa
          cairo
          pango
          cups
          libdrm
          xorg.libX11
          xorg.libXcomposite
          xorg.libXdamage
          xorg.libXext
          xorg.libXfixes
          xorg.libXrandr
          xorg.libxcb
          xorg.libXcursor
          xorg.libXi
          xorg.libXtst
          xorg.libxshmfence
          libxkbcommon
        ];
      in
      {
        devShells.default = pkgs.mkShell {
          inherit nixpkgsConfig;

          buildInputs = with pkgs; [
            nodejs_22
            bun
            playwright
            chromium
            sops
            age
            gitleaks
            corepack_22
            git
          ] ++ playwrightLibs;

          shellHook = ''
            export LD_LIBRARY_PATH="${pkgs.lib.makeLibraryPath playwrightLibs}:$LD_LIBRARY_PATH"
            export PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1
            export PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH="${pkgs.chromium}/bin/chromium"
            echo "🚀 Swipe-pad development environment loaded"
            echo "📦 Node.js: $(node --version)"
            echo "🍞 Bun: $(bun --version)"
            echo "🎭 Playwright: $(bunx --yes playwright --version 2>/dev/null || true)"
            echo "🛠️  Use 'bun dev' to start"
          '';
        };
      });
}
