"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGrpcClient = createGrpcClient;
const grpc = __importStar(require("@grpc/grpc-js"));
const protoLoader = __importStar(require("@grpc/proto-loader"));
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
function createGrpcClient(protoPath, packageName, serviceName, url
// eslint-disable-next-line @typescript-eslint/no-explicit-any
) {
    const packageDef = protoLoader.loadSync(protoPath, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
    });
    const proto = grpc.loadPackageDefinition(packageDef);
    const pkg = proto[packageName];
    return new pkg[serviceName](url, grpc.credentials.createInsecure());
}
//# sourceMappingURL=grpc.client.js.map