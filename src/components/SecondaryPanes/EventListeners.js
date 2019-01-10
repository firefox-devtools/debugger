/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import React, { Component } from "react";
import { connect } from "../../utils/connect";
import actions from "../../actions";
import { getActiveEventListeners } from "../../selectors";

import "./EventListeners.css";

const CATEGORIES = {
  Mouse: ["click", "mouseover", "dblclick"],
  Keyboard: ["keyup", "keydown"]
};

class EventListeners extends Component<Props, State> {
  getContents() {
    const { activeEventListeners } = this.props;

    console.log("getContents: activeEventListeners: ", activeEventListeners);

    return (
      <ul className="event-listeners-list">
        {Object.keys(CATEGORIES).map(category => {
          return (
            <li className="event-listener-group" key={category}>
              <label>
                <input
                  type="checkbox"
                  value={category}
                  onChange={e =>
                    this.onCategoryClick(category, e.target.checked)
                  }
                />
                <span className="event-listener-category">{category}</span>
              </label>
              <ul>
                {CATEGORIES[category].map(event => {
                  const key = `${category}:${event}`;
                  return (
                    <li className="event-listener-event" key={key}>
                      <label>
                        <input
                          type="checkbox"
                          value={key}
                          onChange={e =>
                            this.onEventClick(key, e.target.checked)
                          }
                          checked={activeEventListeners.contains(key)}
                        />
                        {event}
                      </label>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    );
  }

  onCategoryClick(category, isChecked) {
    console.log("Category click!", category, isChecked);

    const { addEventListeners, removeEventListeners } = this.props;
    if (isChecked) {
      addEventListeners(CATEGORIES[category]);
    } else {
      removeEventListeners(CATEGORIES[category]);
    }
  }

  onEventClick(eventType, isChecked) {
    console.log("Event click", eventType, isChecked);

    const { addEventListeners, removeEventListeners } = this.props;
    if (isChecked) {
      addEventListeners([eventType]);
    } else {
      removeEventListeners([eventType]);
    }
  }

  render() {
    return <div>{this.getContents()}</div>;
  }
}

const mapStateToProps = state => ({
  activeEventListeners: getActiveEventListeners(state)
});

export default connect(
  mapStateToProps,
  {
    addEventListeners: actions.addEventListeners,
    removeEventListeners: actions.removeEventListeners
  }
)(EventListeners);
