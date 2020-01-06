// @ts-ignore TODO type
import { createStyles, makeStyles, Theme } from "@material-ui/core/es/styles";

export default makeStyles((_: Theme) =>
  createStyles({
    table: {
      width: "100%",
      backgroundColor: "white",
      padding: "0",
      "border-spacing": "0"
    },
    row: {
      padding: 0
    },
    // cells
    cell: {
      border: "1px solid transparent",
      "border-width": "1px 0",
      "vertical-align": "top",
      padding: 0,
    },
    selectedCell: {
      border: "1px solid #ece85b",
      "border-width": "1px 0",
      "background-color": "#fefedd"
    },
    titleCell: {
      position: "relative",
      "padding-right": "1.5em",
    },
    contentCell: {
      width: "30%",
      color: "gray",
      padding: "0 0.5em",
      "font-size": "0.8em"
    },
    checkboxCell: {
      width: "1.5em"
    },
    // elements
    title: {
      width: "100%",
      outline: "0px solid transparent",
      "padding-left": "0.2em",
      display: "inline-block",
      // TODO em
      "padding-top": "3px",
      height: '1.5em'
    },
    arrow: {
      position: "absolute",
      right: 0,
      top: 0
    },
    checkbox: {
      // TODO WTF?
      padding: '0 !important',
      // TODO WTF?
      margin: '0 !important',
      "font-size": "1.2rem"
    },
    indent: {
      "padding-left": "1.5em"
    }
  })
);
