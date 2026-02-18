import path from "path";
import { createGrpcClient } from "shared-libraries";
import { GRPC_CONFIG } from "shared-libraries";

// Proto file is shipped inside shared-libraries package
const PROTO_PATH = path.resolve(
    __dirname,
    "../../node_modules/shared-libraries/dist/grpc/proto/loan.proto"
);

// Client is created once and reused (lazy singleton via module scope)
const emiClient = createGrpcClient(
    PROTO_PATH,
    "loan",
    "EmiService",
    GRPC_CONFIG.EMI_SERVICE_URL
);

export interface CreateEmiRequest {
    loanId: string;
    amount: number;
}

export interface CreateEmiResponse {
    message: string;
}

/**
 * Call the EMI service via gRPC to create an EMI schedule.
 * Returns a Promise so callers can await it.
 */
export function createEmi(request: CreateEmiRequest): Promise<CreateEmiResponse> {
    return new Promise((resolve, reject) => {
        emiClient.CreateEmi(request, (err: Error | null, response: CreateEmiResponse) => {
            if (err) {
                console.error("[Loan gRPC] CreateEmi failed:", err.message);
                return reject(err);
            }
            console.log("[Loan gRPC] CreateEmi response:", response.message);
            resolve(response);
        });
    });
}
