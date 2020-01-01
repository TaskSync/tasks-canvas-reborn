import { createStyles, makeStyles, Theme } from "@material-ui/core/es/styles";

export default makeStyles((theme: Theme) =>
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
    cell: {
      border: "1px solid transparent",
      "border-width": "1px 0",
      "vertical-align": "top"
    },
    textCell: {
      position: "relative",
      'padding-right': '1.5em'
    },
    selectedCell: {
      border: "1px solid #ece85b",
      "border-width": "1px 0",
      "background-color": "#fefedd"
    },
    title: {
      width: "100%",
      outline: "0px solid transparent",
      "padding-left": "0.2em"
      // TODO no line breaks
    },
    contentCell: {
      width: "30%",
      color: "gray",
      padding: '0 0.5em'
    },
    arrow: {
      position: "absolute",
      right: 0,
      top: 0,
    },
    checkboxCell: {},
    checkbox: {
      padding: 0,
      margin: 0,
      "font-size": "1.2rem"
    },
    indent: {
      "padding-left": "1.5em"
    }
  })
);
