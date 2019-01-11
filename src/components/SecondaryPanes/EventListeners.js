/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import React, { Component } from "react";
import { findKey } from "lodash";

import { connect } from "../../utils/connect";
import actions from "../../actions";
import { getActiveEventListeners } from "../../selectors";

const { Tree } = require("devtools-components");

import "./EventListeners.css";

const CATEGORIES = {
  Mouse: ["click", "mouseover", "dblclick"],
  Keyboard: ["keyup", "keydown"]
};

class EventListeners extends Component<Props, State> {
  getContents() {
    const { activeEventListeners } = this.props;

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
                          checked={activeEventListeners.includes(key)}
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

  renderItem = item => {
    const { activeEventListeners } = this.props;
    const isCategory = CATEGORIES[item] != undefined;

    const key = isCategory
      ? item
      : `${findKey(CATEGORIES, k => k.includes(item))}:${item}`;

    return (
      <div className="event-listener-event" onClick={e => e.stopPropagation()}>
        <label>
          <input
            type="checkbox"
            value={key}
            onChange={e => {
              e.stopPropagation();

              const checked = e.target.checked;
              isCategory
                ? this.onCategoryClick(key, checked)
                : this.onEventClick(key, checked);
            }}
            checked={activeEventListeners.includes(key)}
          />
          {item}
        </label>
      </div>
    );
  };

  getTree() {
    const data = {
      children: CATEGORIES
    };

    return (
      <div>
        <Tree
          getRoots={() => Object.keys(data.children)}
          getParent={x => data}
          getChildren={x => (CATEGORIES[x] ? CATEGORIES[x] : [])}
          renderItem={this.renderItem}
          isExpanded={() => true}
          getKey={x => x}
        />
      </div>
    );
  }

  onCategoryClick(category, isChecked) {
    const { addEventListeners, removeEventListeners } = this.props;
    const events = CATEGORIES[category].map(event => `${category}:${event}`);

    if (isChecked) {
      addEventListeners(events);
    } else {
      removeEventListeners(events);
    }
  }

  onEventClick(eventType, isChecked) {
    const { addEventListeners, removeEventListeners } = this.props;
    if (isChecked) {
      addEventListeners([eventType]);
    } else {
      removeEventListeners([eventType]);
    }
  }

  render() {
    return (
      <div>
        {/* this.getContents()*/}
        {this.getTree()}
      </div>
    );
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
