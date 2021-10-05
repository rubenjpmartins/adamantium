import { ApiProperty } from "@nestjs/swagger";
import Joi, { string } from "joi";
import { ECCurve } from "../../vault/vault-keys";

export class CreateKeyRequest {
    @ApiProperty({
        enum: ECCurve,
        example: ECCurve.ed25519,
        type: string
    })
    type: string

    @ApiProperty()
    name: string
}

export const CreateKeySchema = Joi.object({
    type: Joi.string().allow('ed25519', 'secp256k1').required(),
    name: Joi.string().required()
})
  