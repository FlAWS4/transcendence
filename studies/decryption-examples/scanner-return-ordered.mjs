import { mount as mountTogether } from './scanner-return-together.mjs';

export function mount(context) {
  return mountTogether({ ...context, resolution: 'ordered' });
}
