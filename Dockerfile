FROM debian:bookworm-slim

# Install Rust and build dependencies
RUN apt-get update && \
    apt-get install -y curl build-essential pkg-config libssl-dev && \
    curl https://sh.rustup.rs -sSf | sh -s -- -y && \
    . $HOME/.cargo/env && \
    rustup default stable

WORKDIR /app
COPY . .

# Clean and build the release binary
RUN . $HOME/.cargo/env && cargo clean && cargo build --release

EXPOSE 3000
CMD ["/app/target/release/auth_api"]