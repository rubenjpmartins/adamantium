import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TransactionEntity } from "src/ethereum/entities/transaction.entity";
import { VaultModule } from "src/vault/vault.module";
import { TransactionService } from "./services/transaction.service";
import { SignerController } from "./signer.controller";

@Module({
    imports: [
        VaultModule,
        TypeOrmModule.forFeature([TransactionEntity])
    ],
    controllers: [SignerController],
    providers: [TransactionService],
    exports: [TransactionService]
})
export class SignerModule {}
