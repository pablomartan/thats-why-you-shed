{
  description = "Node development environment with pnpm for `That's why you shed`";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-25.05";
  };

  outputs = {
    self,
    nixpkgs,
  }: let
    system = "x86_64-linux";
    pkgs = nixpkgs.legacyPackages.${system};
  in
    with pkgs; {
      devShells.${system}.default = mkShell {
        packages = [nodejs nodePackages.pnpm];
      };
    };
}
