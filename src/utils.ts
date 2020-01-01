// source - stack overflow
export function getCaretPosition(editableDiv: HTMLElement) {
  var caretPos = 0,
    sel,
    range;
  if (window.getSelection) {
    sel = window.getSelection()!;
    if (sel.rangeCount) {
      range = sel.getRangeAt(0);
      if (range.commonAncestorContainer.parentNode == editableDiv) {
        caretPos = range.endOffset;
      }
    }
  } else {
    // @ts-ignore
    if (document.selection && document.selection.createRange) {
      // @ts-ignore
      range = document.selection.createRange();
      if (range.parentElement() == editableDiv) {
        var tempEl = document.createElement("span");
        editableDiv.insertBefore(tempEl, editableDiv.firstChild);
        var tempRange = range.duplicate();
        tempRange.moveToElementText(tempEl);
        tempRange.setEndPoint("EndToEnd", range);
        caretPos = tempRange.text.length;
      }
    }
  }
  return caretPos;
}

// https://stackoverflow.com/questions/10707972/detecting-if-a-character-is-a-letter
export function isALetter(charVal: string) {
  if (charVal.toUpperCase() != charVal.toLowerCase()) {
    return true;
  } else {
    return false;
  }
}
