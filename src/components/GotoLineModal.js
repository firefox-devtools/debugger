// @flow

import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { getActiveSearch, getSelectedSource } from "../selectors";
import actions from "../actions";

import Modal from "./shared/Modal";

import SearchInput from "./shared/SearchInput";

import type { SourceRecord } from "../reducers/sources";
import type { SelectSourceOptions } from "../actions/sources";

type GotoLineModalState = {
  query: ?string
};

class GotoLineModal extends Component {
  state: GotoLineModalState;

  props: {
    enabled: boolean,
    selectSource: (string, ?SelectSourceOptions) => void,
    selectedSource?: SourceRecord,
    closeActiveSearch: () => void,
    highlightLineRange: ({ start: number, end: number }) => void,
    clearHighlightLineRange: () => void
  };

  constructor(props) {
    super(props);
    this.state = { query: "" };
  }

  onClick = (e: SyntheticEvent) => {
    e.stopPropagation();
  };

  onChange = (e: SyntheticInputEvent) => {
    const { selectedSource } = this.props;
    if (!selectedSource || !selectedSource.get("text")) {
      return;
    }

    this.setState({ query: e.target.value });
  };

  closeModal = () => {
    this.props.closeActiveSearch();
    this.props.clearHighlightLineRange();
  };

  onKeyUp = (e: SyntheticKeyboardEvent) => {
    e.preventDefault();
    const { selectSource, selectedSource, enabled } = this.props;
    const { query } = this.state;

    if (!enabled || !selectedSource) {
      return;
    }

    if (e.key === "Enter" && query != null) {
      const linenumber = parseInt(query.replace(/[^\d+]/g, ""), 10);
      if (!isNaN(linenumber)) {
        selectSource(selectedSource.get("id"), { line: linenumber });
      }
      this.closeModal();
      return;
    }

    if (e.key === "Tab") {
      this.closeModal();
      return;
    }
    return;
  };

  renderInput() {
    const { query } = this.state;

    return (
      <div key="input" className="input-wrapper">
        <SearchInput
          query={query}
          placeholder={this.buildPlaceHolder()}
          onChange={this.onChange}
          onKeyUp={this.onKeyUp}
          handleClose={this.closeModal}
        />
      </div>
    );
  }

  buildPlaceHolder = () => L10N.getFormatStr("gotoLineModal.placeholder");

  render() {
    const { enabled } = this.props;

    if (!enabled) {
      return null;
    }

    return (
      <Modal in={enabled} handleClose={this.closeModal}>
        {this.renderInput()}
      </Modal>
    );
  }
}

export default connect(
  state => {
    const source = getSelectedSource(state);
    return {
      enabled: Boolean(getActiveSearch(state) === "line" && source)
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(GotoLineModal);
