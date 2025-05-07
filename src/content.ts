/**
 * Content script.
 * https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts
 *
 * This script is run in the context of the webpage rather than the extension.
 */

document.addEventListener('selectionchange', () => {
  const highlightedText = window.getSelection()?.toString().trim();
  chrome.storage.local.set({ highlightedText });
});
