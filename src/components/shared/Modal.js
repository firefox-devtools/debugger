// @flow

import { createFactory, DOM as dom, Component, PropTypes } from "react";
import classnames from "classnames";
import _Transition from "react-transition-group/Transition";
const Transition = createFactory(_Transition);

import "./Modal.css";

function Slide({ in: inProp, children }) {
  return Transition({ in: inProp, timeout: 200 }, children);
}

export default class Modal extends Component {
  props: {
    enabled: boolean,
    shortcut: string,
    children: any,
    handleOpen: () => any,
    handleClose: () => any
  };

  constructor(props) {
    super(props);
    const self: any = this;
    self.onClick = this.onClick.bind(this);
  }

  componentWillUnmount() {
    const shortcuts = this.context.shortcuts;
    shortcuts.off("Escape");
    shortcuts.off(L10N.getStr(this.props.shortcut));
  }

  componentDidMount() {
    const shortcuts = this.context.shortcuts;
    shortcuts.on("Escape", this.props.handleClose);
    shortcuts.on(L10N.getStr(this.props.shortcut), this.props.handleOpen);
  }

  onClick(e: SyntheticEvent) {
    e.stopPropagation();
  }

  render() {
    const { enabled } = this.props;
    return dom.div(
      {
        className: classnames("modal-wrapper", { enabled }),
        onClick: this.props.handleClose
      },
      Slide({
        in: enabled,
        children: status => {
          return dom.div(
            { className: classnames("modal", status), onClick: this.onClick },
            this.props.children
          );
        }
      })
    );
  }
}

Modal.displayName = "Modal";
Modal.contextTypes = {
  shortcuts: PropTypes.object
};
