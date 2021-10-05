import { Module } from "@nestjs/common";
import { VaultModule } from "src/vault/vault.module";
import { SignerService } from "./services/signer.service";
import { SignerController } from "./signer.controller";

@Module({
    imports: [VaultModule],
    controllers: [SignerController],
    providers: [SignerService],
    exports: [SignerService]
})
export class SignerModule {}
