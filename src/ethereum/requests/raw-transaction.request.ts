import { ApiProperty } from "@nestjs/swagger";

export class RawTransactionRequest {
    @ApiProperty()
    data: string;
}

