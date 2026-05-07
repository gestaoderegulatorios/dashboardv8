import { showToast } from './shared.js';
import { VIEW_LABELS } from '../model/branding.js';
import { uploadTemplate, wireUploadEvents } from './upload-fragments.js';

// Slim mount that delegates to extracted template and event wiring
function mount(host, _ctx) {
  host.innerHTML = uploadTemplate();
  const unmount = wireUploadEvents(host, { showToast });
  return unmount;
}

export const uploadView = {
  id: 'upload',
  ...VIEW_LABELS.upload,
  mount
};
