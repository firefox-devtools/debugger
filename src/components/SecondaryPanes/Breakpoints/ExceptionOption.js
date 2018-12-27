/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import React from "react";

type ExceptionOptionProps = {
  className: string,
  isChecked: boolean,
  label: string,
  onChange: Function
};

export default function ExceptionOption({
  className,
  isChecked = false,
  label,
  onChange
}: ExceptionOptionProps) {
  return (
    <div className={className}>
      <label
        htmlFor="breakpoint-exceptions-checkbox"
        className="breakpoint-exceptions-label"
      >
        <input
          type="checkbox"
          id="breakpoint-exceptions-checkbox"
          checked={isChecked ? "checked" : ""}
          onChange={onChange}
        />
        {label}
      </label>
    </div>
  );
}
