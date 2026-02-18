export const GRPC_CONFIG = {
    // In Docker: use service name. Locally: use localhost.
    EMI_SERVICE_URL: process.env["EMI_GRPC_URL"] ?? "emi-service:50051",
    SERVER_PORT: process.env["GRPC_PORT"] ?? "0.0.0.0:50051",
};
