FROM mcr.microsoft.com/devcontainers/base:debian

# Installing development tools
RUN apt-get -y update
RUN apt-get -y upgrade
RUN apt-get -y install git gh unzip curl bash

# Change user to vscode
USER vscode

# Installing bun binaries
RUN curl -fsSL https://bun.com/install | bash

# Set environment
ENV BUN_INSTALL="$HOME/.bun"
ENV PATH="$BUN_INSTALL/bin:$PATH"