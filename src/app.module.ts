import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm";
import { NonceEntity } from "./ethereum/entities/nonce.entity";
import { EthereumModule } from "./ethereum/ethereum.module";
import { SignerModule } from "./signer/signer.module";
import { VaultModule } from "./vault/vault.module";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      database: 'example',
      username: 'example',
      password: 'example',
      entities: [NonceEntity],
      synchronize: true,
      type: 'postgres',
      host: 'db_postgres',
      port: 5432
    }),
    SignerModule,
    EthereumModule,
    VaultModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
