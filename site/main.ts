import './style.css';

const preview = document.querySelector<HTMLButtonElement>('#site-preview');
const demoStatus = document.querySelector<HTMLElement>('#demo-status');

preview?.addEventListener('click', () => {
  if (!('speechSynthesis' in window)) {
    if (demoStatus) demoStatus.textContent = 'Speech preview is not available in this browser.';
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance('cue burr net eez');
  utterance.rate = 0.86;
  utterance.onstart = () => { preview.setAttribute('aria-pressed', 'true'); if (demoStatus) demoStatus.textContent = 'Playing the sample.'; };
  utterance.onend = () => { preview.setAttribute('aria-pressed', 'false'); if (demoStatus) demoStatus.textContent = 'Sample finished.'; };
  utterance.onerror = () => { preview.setAttribute('aria-pressed', 'false'); if (demoStatus) demoStatus.textContent = 'Your browser could not play this sample.'; };
  window.speechSynthesis.speak(utterance);
});

const offlineNotice = document.querySelector<HTMLElement>('#offline-notice');
function updateConnection() {
  if (offlineNotice) offlineNotice.hidden = navigator.onLine;
}
window.addEventListener('online', updateConnection);
window.addEventListener('offline', updateConnection);
updateConnection();

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => void navigator.serviceWorker.register('/sw.js'));
}
