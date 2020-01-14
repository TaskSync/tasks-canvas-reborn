// source - stack overflow
import { KeyboardEvent } from "react";
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

/**
 * Returns true if ctrl (linux, win) or meta (mac) has been pressed and not
 * the other.
 */
export function ctrlMetaPressed(event: KeyboardEvent<HTMLElement>) {
  return isMacOS()
    ? event.metaKey && !event.ctrlKey
    : !event.metaKey && event.ctrlKey;
}
