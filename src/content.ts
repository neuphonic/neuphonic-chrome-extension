/**
 * Content script.
 * https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts
 *
 * This script is run in the context of the webpage rather than the extension.
 */

/**
 * Add an event listener that listens to `selectionchange` event and then stores the currently
 * highlighted text in the local storage for the extension so that the widget can access it.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/Document/selectionchange_event
 */
document.addEventListener('selectionchange', () => {
  const highlightedText = window.getSelection()?.toString().trim();
  chrome.storage.local.set({ highlightedText });
});
