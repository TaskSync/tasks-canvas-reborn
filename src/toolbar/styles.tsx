// @ts-ignore TODO type
import { createStyles, makeStyles, Theme } from "@material-ui/core/es/styles";

export default makeStyles((_: Theme) =>
  createStyles({
    toolbar: {
      "max-height": "2em",
      "min-height": "2em",
      padding: "0 0.5em",
      // TODO gradient
      background: "lightgray"
    },
    grow: {
      flexGrow: 1
    },
    divider: {
      height: "1em",
      margin: "0 0.2em"
    },
    sectionRight: {
      display: "flex"
    },
    iconButton: {},
    button: {
      "text-transform": "initial"
    }
  })
);
