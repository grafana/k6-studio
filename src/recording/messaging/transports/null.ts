import { Transport } from './transport'

/**
 * Transport that does nothing. Useful if you only
 * want to send messages to yourself.
 */
export class NullTransport extends Transport {
  send(): void {}
}
