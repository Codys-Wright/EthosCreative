import { AuthService } from '@auth/server';
import * as Effect from 'effect/Effect';
import { globalValue } from 'effect/GlobalValue';
import * as Layer from 'effect/Layer';
import * as ManagedRuntime from 'effect/ManagedRuntime';

// Use globalValue to persist the memoMap across hot reloads
const memoMap = globalValue(Symbol.for('@songmaking/server-memoMap'), () =>
  Effect.runSync(Layer.makeMemoMap),
);

// Server layer with AuthService
const serverLayer = AuthService.Default;

// Use globalValue to persist the runtime across hot reloads
// This prevents "ManagedRuntime disposed" errors during HMR
export const serverRuntime = globalValue(
  Symbol.for('@songmaking/server-runtime'),
  () => ManagedRuntime.make(serverLayer, memoMap),
);
