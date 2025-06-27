# Use a more recent base image
FROM debian:bookworm-slim

# Install dependencies for building Rust applications
RUN apt-get update && \
    apt-get install -y curl build-essential pkg-config libssl-dev musl-tools && \
    curl https://sh.rustup.rs -sSf | sh -s -- -y && \
    . $HOME/.cargo/env && \
    rustup default stable

# Set environment variables for static linking
ENV RUSTFLAGS="-C target-feature=+crt-static"
ENV CARGO_TARGET_DIR=/app/target

WORKDIR /app
COPY . .

# Build the release binary
RUN . $HOME/.cargo/env && cargo build --release

# Expose the port and run the binary
EXPOSE 3000
CMD ["/app/target/release/auth_api"]
