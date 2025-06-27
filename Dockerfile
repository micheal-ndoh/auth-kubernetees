# Backend Dockerfile
FROM rust:latest AS builder
WORKDIR /usr/src/app
COPY . .
RUN cargo build --release

FROM debian:buster-slim
WORKDIR /app
COPY --from=builder /usr/src/app/target/release/auth_api /app/auth_api
ENV RUST_LOG=info
EXPOSE 3000
CMD ["/app/auth_api"] 