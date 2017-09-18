import React, { Component } from "react";

class Punny extends Component {
  constructor(props) {
    super();
    this.onClick = this.onClick.bind(this);
  }

  componentDidMount() {}

  onClick() {}

  renderMe() {
    return <div onClick={this.onClick} />;
  }

  render() {}
}
