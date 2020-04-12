// @ts-ignore TODO type
import { createStyles, makeStyles, Theme } from "@material-ui/core/es/styles";

export default makeStyles((_: Theme) =>
  createStyles({
    table: {
      width: "100%",
      backgroundColor: "white",
      padding: "0",
      "border-spacing": "0",
    },
    row: {
      padding: 0,
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
      "background-color": "#fefedd",
    },
    titleCell: {
      position: "relative",
      "padding-right": "1.5em",
      "vertical-align": "middle",
    },
    contentCell: {
      width: "30%",
      padding: "0 0.5em",
      "font-size": "0.95em",
      "text-overflow": "ellipsis",
      "white-space": "nowrap",
    },
    checkboxCell: {
      width: "1.5em",
    },
    // elements
    title: {
      width: "100%",
      outline: "0px solid transparent",
      "padding-left": "0.2em",
      "padding-top": "0.1em",
      display: "inline-block",
    },
    arrow: {
      position: "absolute",
      right: 0,
      top: 0,
    },
    checkbox: {
      // TODO WTF?
      padding: "0 !important",
      // TODO WTF?
      // TODO em
      margin: "2px 0 0 0 !important",
      "font-size": "1.2rem",
    },
    indent: {
      "padding-left": "1.5em",
    },
    content: {
      color: "gray",
      "text-decoration": "none",
      "&:hover": {
        "text-decoration": "underline",
        color: "darkgray",
      },
      "&:visited": {
        color: "gray",
        "text-decoration": "none",
      },
    },
  })
);
