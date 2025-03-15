import { Transport } from './transport'

export class NullTransport extends Transport {
  send(): void {}
}
