// When using CDP, some pages will open with an empty document with readyState "completed"
// the first time that a page is loaded. This means our UI is injected into the empty document,
// then the document is replaced with the actual content, making our UI disappear.
//
// It's not entirely clear why this happens and there doesn't seem to be any events firing that
// we can rely on. So instead, we use use a brute-force polling mechanism to monitor if the document
// reference changes during the opening stages of the page. It's not pretty but it works.
//
// This covers only the initial empty-document swap (a navigation commit that
// replaces the Document object). The other way a page loses our UI is
// document.open(), which reuses the same Document object and so is invisible
// to this poll; that case is handled from the main process, which re-injects
// the whole script on CDP's Page.documentOpened event (see the documentOpened
// handler in src/recorder/launchers/cdp/page.ts).
//
// The caller must stop the monitor when the view that started it is disposed.
// A poll left running on a copy of the script whose document was handed over
// still holds that dead copy's onChange, and would start a view that nothing
// can dispose again.
export function monitorDocumentChange(onChange: () => void) {
  const abortController = new AbortController()

  function stopMonitoring() {
    abortController.abort()
  }

  // During this short period of time the document will have the URL "about:blank", so if it's
  // different then we can skip this check entirely.
  if (document.location.href !== 'about:blank') {
    return stopMonitoring
  }

  const currentDocument = document

  setTimeout(function checkDocumentInstance() {
    if (abortController.signal.aborted) {
      return
    }

    if (document === currentDocument) {
      setTimeout(checkDocumentInstance, 1)

      return
    }

    onChange()
  }, 1)

  // We only need to monitor the first few seconds or so. If nothing has changed
  // by then, there's no point in wasting CPU cycles.
  setTimeout(stopMonitoring, 5000)

  return stopMonitoring
}
