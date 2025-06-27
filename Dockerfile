# Single-stage Dockerfile for Rust backend
FROM debian:bullseye-slim

# Install Rust and build dependencies
RUN apt-get update && \
    apt-get install -y curl build-essential pkg-config libssl-dev && \
    curl https://sh.rustup.rs -sSf | sh -s -- -y && \
    . $HOME/.cargo/env && \
    rustup default stable

WORKDIR /app
COPY . .

# Build the release binary
RUN . $HOME/.cargo/env && cargo build --release

# Expose the port and run the binary
EXPOSE 3000
CMD ["/app/target/release/auth_api"] 