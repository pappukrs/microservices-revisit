import path from "path";
import * as grpc from "@grpc/grpc-js";
import { createGrpcServer } from "shared-libraries";
import { GRPC_CONFIG } from "shared-libraries";

// Proto file is shipped inside shared-libraries package
const PROTO_PATH = path.resolve(
    __dirname,
    "../../node_modules/shared-libraries/dist/grpc/proto/loan.proto"
);

const { server, proto } = createGrpcServer(PROTO_PATH, "loan");

server.addService(proto.EmiService.service, {
    CreateEmi: (call: any, callback: any) => {
        const { loanId, amount } = call.request;
        console.log(`[EMI gRPC] CreateEmi called — loanId: ${loanId}, amount: ${amount}`);

        // TODO: persist EMI schedule to DB
        callback(null, {
            message: `EMI schedule created for loan ${loanId}`,
        });
    },
});

export function startEmiServer(): void {
    server.bindAsync(
        GRPC_CONFIG.SERVER_PORT,
        grpc.ServerCredentials.createInsecure(),
        (err: Error | null, port: number) => {
            if (err) {
                console.error("[EMI gRPC] Failed to start server:", err.message);
                return;
            }
            console.log(`[EMI gRPC] Server running on port ${port}`);
            server.start();
        }
    );
}
