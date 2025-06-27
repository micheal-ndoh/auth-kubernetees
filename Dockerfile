FROM rust:latest AS builder

WORKDIR /app
COPY . .

# Build with default target (no forced static linking for proc-macros)
RUN cargo build --release

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y libssl3 ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /app/target/release/auth_api /app/auth_api

EXPOSE 3000
CMD ["/app/auth_api"]