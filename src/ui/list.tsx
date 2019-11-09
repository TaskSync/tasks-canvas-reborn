import { inject, observer } from "mobx-react";
import React, { ReactEventHandler } from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import InboxIcon from "@material-ui/icons/Inbox";
import DraftsIcon from "@material-ui/icons/Drafts";
import {
  createStyles,
  Theme,
  WithStyles,
  withStyles
} from "@material-ui/core/es/styles";

const styles = (theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
      maxWidth: 360,
      backgroundColor: theme.palette.background.paper
    }
  });

const stylesDecorator = withStyles(styles, {
  name: "ListUI"
});

interface Props extends WithStyles<typeof styles> {
  registeredUsername?: string;
  forgingPK: string | null;
  error?: null | "insufficient-funds";
  onClose: ReactEventHandler<{}>;
}

interface InjectedProps extends Props {}

interface State {
  usernameInvalid?: boolean;
  mnemonicInvalid?: boolean;
}

@inject("store")
@inject("routerStore")
@inject("addressBookStore")
@observer
export class ListUI extends React.Component<InjectedProps, State> {
  state: State = {};

  get injected(): InjectedProps {
    return this.props as InjectedProps;
  }

  render() {
    const { classes } = this.props;
    const [selectedIndex, setSelectedIndex] = React.useState(1);

    const handleListItemClick = (
      event: React.MouseEvent<HTMLDivElement, MouseEvent>,
      index: number
    ) => {
      setSelectedIndex(index);
    };

    return (
      <div className={classes.root}>
        <List component="nav" aria-label="main mailbox folders">
          <ListItem
            button
            selected={selectedIndex === 0}
            onClick={event => handleListItemClick(event, 0)}
          >
            <ListItemIcon>
              <InboxIcon />
            </ListItemIcon>
            <ListItemText primary="Inbox" />
          </ListItem>
          <ListItem
            button
            selected={selectedIndex === 1}
            onClick={event => handleListItemClick(event, 1)}
          >
            <ListItemIcon>
              <DraftsIcon />
            </ListItemIcon>
            <ListItemText primary="Drafts" />
          </ListItem>
        </List>
        <Divider />
        <List component="nav" aria-label="secondary mailbox folder">
          <ListItem
            button
            selected={selectedIndex === 2}
            onClick={event => handleListItemClick(event, 2)}
          >
            <ListItemText primary="Trash" />
          </ListItem>
          <ListItem
            button
            selected={selectedIndex === 3}
            onClick={event => handleListItemClick(event, 3)}
          >
            <ListItemText primary="Spam" />
          </ListItem>
        </List>
      </div>
    );
  }
}

export default stylesDecorator(ListUI);
