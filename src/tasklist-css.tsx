import { createStyles, makeStyles, Theme } from "@material-ui/core/es/styles";

export default makeStyles((theme: Theme) =>
  createStyles({
    list: {
      width: "100%",
      backgroundColor: "white",
      padding: "0"
    },
    item: {
      width: '50%',
      margin: "0.1em 0",
    },
    itemWrapper: {
      transition: 'none',
      padding: 0,
      "&:hover": {
        // TODO !important
        "background-color": "transparent !important"
      },
      // TODO doesnt work
      // "&$focusVisible": {
      //   // TODO !important
      //   "background-color": "transparent !important"
      // }
    },
    selected: {
      border: "1px solid yellow",
      "border-width": "1px 0",
      // TODO !important
      "background-color": "#fffff7 !important",
      "&:hover": {
        // TODO !important
        "background-color": "#fffff7 !important"
      }
    },
    text: {
      width: "100%",
      outline: "0px solid transparent",
      "padding-left": "0.2em"
      // TODO no line breaks
    },
    arrow: {
      "margin-right": "10px"
    },
    checkbox: {
      padding: 0,
      margin: 0,
      'font-size': '1.2rem'
    },
    indent: {
      "padding-left": "1.5em"
    }
  })
);
