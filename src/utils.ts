// source - stack overflow
import { TSelection } from "./store";

// TODO use `selection-ranges` ???
export function getSelection(
  editableDiv: HTMLElement
): TSelection | undefined {
  const sel = window.getSelection();
  if (sel?.rangeCount) {
    const range = sel.getRangeAt(0);
    if (range.commonAncestorContainer.parentNode == editableDiv) {
      return [range.startOffset, range.endOffset];
    }
  }
  return undefined;
}

// https://stackoverflow.com/questions/10707972/detecting-if-a-character-is-a-letter
// TODO isChar
export function isALetter(charVal: string) {
  return charVal.toUpperCase() != charVal.toLowerCase();
}
