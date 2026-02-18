import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

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
export function createGrpcClient(
    protoPath: string,
    packageName: string,
    serviceName: string,
    url: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
    const packageDef = protoLoader.loadSync(protoPath, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
    });

    const proto = grpc.loadPackageDefinition(packageDef) as Record<string, any>;
    const pkg = proto[packageName] as Record<string, any>;

    return new pkg[serviceName](url, grpc.credentials.createInsecure());
}
