import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

export interface GrpcServerBundle {
    server: grpc.Server;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    proto: any;
}

/**
 * Create a gRPC server loaded from a .proto file.
 *
 * @param protoPath   Absolute path to the .proto file
 * @param packageName The proto package name (e.g. "loan")
 *
 * @example
 * const { server, proto } = createGrpcServer(PROTO_PATH, "loan");
 * server.addService(proto.EmiService.service, handlers);
 * server.bindAsync("0.0.0.0:50051", grpc.ServerCredentials.createInsecure(), () => server.start());
 */
export function createGrpcServer(protoPath: string, packageName: string): GrpcServerBundle {
    const packageDef = protoLoader.loadSync(protoPath, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
    });

    const proto = grpc.loadPackageDefinition(packageDef);

    return {
        server: new grpc.Server(),
        proto: proto[packageName],
    };
}
