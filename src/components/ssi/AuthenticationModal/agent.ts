import { createAgent } from '@veramo/core'
import {
  IQRCodeGenerator,
  QrCodeProvider
} from '@sphereon/ssi-sdk.qr-code-generator'
import {
  ISIOPv2OID4VPRPRestClient,
  SIOPv2OID4VPRPRestClient
} from '@sphereon/ssi-sdk.siopv2-oid4vp-rp-rest-client'

const agent = createAgent<IQRCodeGenerator & ISIOPv2OID4VPRPRestClient>({
  plugins: [
    new QrCodeProvider(),
    new SIOPv2OID4VPRPRestClient({
      baseUrl: process.env.NEXT_PUBLIC_OID4VP_AGENT_BASE_URL,
      definitionId: process.env.NEXT_PUBLIC_OID4VP_PRESENTATION_DEF_ID
    })
  ]
})
export default agent
