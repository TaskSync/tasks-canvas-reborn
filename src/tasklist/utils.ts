// source - stack overflow
import { TSelection } from "./store";

// TODO use `selection-ranges` ???
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
