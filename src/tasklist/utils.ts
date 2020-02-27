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
      return [range.startOffset, range.endOffset, isSelectionBackwards(sel)];
    }
  }
  return undefined;
}

function isSelectionBackwards(sel: Selection) {
  let backward = false;
  if (!sel.isCollapsed) {
    const range = document.createRange();
    range.setStart(sel.anchorNode!, sel.anchorOffset);
    range.setEnd(sel.focusNode!, sel.focusOffset);
    backward = range.collapsed;
  }
  return backward;
}

export function flipSelectionBackwards() {
  const sel = window.getSelection()!;
  const range = sel.getRangeAt(0);
  const endRange = range.cloneRange();
  endRange.collapse(false);
  sel.removeAllRanges();
  sel.addRange(endRange);
  sel.extend(range.startContainer, range.startOffset);
  return true;
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
