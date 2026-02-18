import * as grpc from "@grpc/grpc-js";
export interface GrpcServerBundle {
    server: grpc.Server;
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
export declare function createGrpcServer(protoPath: string, packageName: string): GrpcServerBundle;
//# sourceMappingURL=grpc.server.d.ts.map