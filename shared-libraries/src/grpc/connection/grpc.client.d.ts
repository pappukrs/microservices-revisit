/**
 * Create a gRPC client for a specific service.
 *
 * @param protoPath   Absolute path to the .proto file
 * @param packageName The proto package name (e.g. "loan")
 * @param serviceName The service name inside the package (e.g. "EmiService")
 * @param url         Host:port of the gRPC server (e.g. "emi-service:50051")
 *
 * @example
 * const client = createGrpcClient(PROTO_PATH, "loan", "EmiService", "emi-service:50051");
 * client.CreateEmi({ loanId: "L123", amount: 50000 }, (err, res) => console.log(res));
 */
export declare function createGrpcClient(protoPath: string, packageName: string, serviceName: string, url: string): any;
//# sourceMappingURL=grpc.client.d.ts.map