// source - stack overflow
import { TSelection } from "./model";

// TODO use `selection-ranges` ???
//  check if it fixes the ios position issue
export function getSelection(editableDiv: HTMLElement): TSelection | undefined {
  const sel = window.getSelection();
  if (sel?.rangeCount) {
    const range = sel.getRangeAt(0);
    if (range.commonAncestorContainer.parentNode == editableDiv) {
      return [range.startOffset, range.endOffset];
    }
  }
  return undefined;
}

export function isMacOS(): boolean {
  return navigator.platform.toLocaleLowerCase().includes("mac");
}
