FROM ghcr.io/noumenadigital/images/engine:2025.1.11

LABEL org.opencontainers.image.source = "https://github.com/noumenadigital/npl-blockchain-starter"

ENV ENGINE_NPL_MIGRATION_DIRECTORY_PATH="/npl"

COPY src/main/migration.yml /npl/migration.yml
COPY src/main/npl/iot_steering  /npl/npl-1.0.0/iot_steering
COPY src/main/contrib /npl-contrib
