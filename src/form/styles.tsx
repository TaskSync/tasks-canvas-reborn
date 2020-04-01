// @ts-ignore TODO type
import { createStyles, makeStyles, Theme } from "@material-ui/core/es/styles";

export default makeStyles((_: Theme) =>
  createStyles({
    form: {},
    textarea: {
      width: "100%",
      "border-color": "lightgray",
      "border-width": "2px",
      outline: "0px solid transparent"
    },
    checkbox: {
      // TODO WTF?
      padding: "0 !important",
      "font-size": "1.2rem"
    },
    back: {
      margin: "0.2em",
      "margin-bottom": "0.6em"
    },
    row: {
      margin: "0.4em"
    }
  })
);
