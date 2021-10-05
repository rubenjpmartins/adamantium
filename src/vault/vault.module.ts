import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import {ConfigService } from "@nestjs/config";
import { VaultService } from "./vault.service";

@Module({
    imports: [HttpModule.register({
        headers: {
            'X-Vault-Token': process.env.VAULT_TOKEN,
            'X-Vault-Request': true,
            'Content': 'application/json'
        },
        baseURL: process.env.VAULT_ADDR
    })],
    controllers: [],
    providers: [VaultService, ConfigService],
    exports: [VaultService]
})
export class VaultModule {}
