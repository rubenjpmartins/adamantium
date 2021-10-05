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
      type: 'mongodb',
      host: 'mongo',
      port: 27017
    }),
    SignerModule,
    EthereumModule,
    VaultModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
