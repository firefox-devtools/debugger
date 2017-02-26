// @flow

import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import actions from "../../actions";
const ObjectInspector = React.createFactory(require("../shared/ObjectInspector"));
const Popover = React.createFactory(require("../shared/Popover"));

import { getLoadedObjects } from "../../selectors";

const { DOM: dom, PropTypes, Component } = React;

class Preview extends Component {
  renderPreview() {
    const {
      loadObjectProperties,
      loadedObjects,
      roots
    } = this.props;

    return ObjectInspector({
      roots,
      getObjectProperties: id => loadedObjects.get(id),
      autoExpandDepth: 0,
      onDoubleClick: () => {},
      loadObjectProperties
    });
  }

  render() {
    const {
      popoverPos,
      onClose
    } = this.props;

    return Popover(
      {
        pos: popoverPos,
        onMouseLeave: onClose
      },
      dom.div(
        {},
        this.renderPreview()
      )
    );
  }
}

Preview.propTypes = {
  loadObjectProperties: PropTypes.func,
  loadedObjects: PropTypes.object,
  selectedFrame: PropTypes.object,
  popoverPos: PropTypes.object,
  roots: PropTypes.array,
  onClose: PropTypes.func
};

Preview.displayName = "Preview";

export default connect(
  state => ({
    loadedObjects: getLoadedObjects(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(Preview);
