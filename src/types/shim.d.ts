import { ProtocolWithReturn } from 'webext-bridge'
import { ACTION, MESSAGE_TYPE } from '@/lib/constants'

declare module 'webext-bridge' {
  export interface ProtocolMap {
    [ACTION.EYEDROPPER]: ProtocolWithReturn<{}, { color: string }>
    [ACTION.LOG]: any
  }
}
