/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import React, { Component } from "react";

import "./EventListeners.css";

const CATEGORIES = {
  Mouse: ["click", "mouseover", "dblclick"],
  Keyboard: ["keyup", "keydown"]
};

class EventListeners extends Component<Props, State> {
  getContents() {
    return Object.keys(CATEGORIES).map(category => {
      return (
        <div className="event-listener-group" key={category}>
          <label>
            <input
              type="checkbox"
              value={category}
              onChange={() => this.onCategoryClick(category)}
            />
            <span className="event-listener-category">{category}</span>
          </label>
          {CATEGORIES[category].map(event => {
            const key = `${category}:${event}`;
            return (
              <div className="event-listener-event" key={key}>
                <label>
                  <input
                    type="checkbox"
                    value={key}
                    onChange={() => this.onEventClick(key)}
                  />
                  {event}
                </label>
              </div>
            );
          })}
        </div>
      );
    });
  }

  onCategoryClick(category) {
    console.log("Category click!", category);
  }

  onEventClick(event) {
    console.log("Event click", event);
  }

  render() {
    return <div>{this.getContents()}</div>;
  }
}

export default EventListeners;
