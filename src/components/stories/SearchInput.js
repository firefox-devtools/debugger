/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import PropTypes from "prop-types";
import React from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";

import SearchInput from "../shared/SearchInput";
import { L10N } from "devtools-launchpad";
import { setValue } from "devtools-config";
import { prefs } from "../../utils/prefs";

import "../App.css";
import "../Editor/SearchBar.css";

import "devtools-modules/src/themes/dark-theme.css";

// NOTE: we need this for supporting L10N in storybook
// we can move this to a shared helper as we add additional stories
if (typeof window == "object") {
  window.L10N = L10N;
  window.L10N.setBundle(require("../../../assets/panel/debugger.properties"));
}

function SearchInputFactory({ dir = "ltr", theme = "dark", ...props }) {
  const themeClass = `theme-${theme}`;
  document.dir = dir;
  document.body.parentNode.className = themeClass;

  prefs.searchNav = true;

  return (
    <div
      style={{
        width: "calc(100vw - 100px)",
        height: "calc(100vh - 100px)",
        margin: "auto",
        display: "flex",
        "flex-direction": "row"
      }}
    >
      <div
        className={`search-bar ${themeClass}`}
        dir={dir}
        style={{
          width: "100vw",
          "align-self": "center"
        }}
      >
        <SearchInput
          placeholder="Search Input"
          query=""
          handleNext={action("handleNext")}
          handlePrev={action("handlePrev")}
          {...props}
        />
      </div>
    </div>
  );
}

SearchInputFactory.propTypes = {
  dir: PropTypes.string,
  theme: PropTypes.string
};

storiesOf("SearchInput", module)
  .add("simple", () => {
    setValue("features.previewWatch", false);
    return <SearchInputFactory />;
  })
  .add("no matches", () => {
    setValue("features.previewWatch", false);
    return <SearchInputFactory count={0} query="YO YO" />;
  })
  .add("matches", () => {
    setValue("features.previewWatch", false);
    return <SearchInputFactory count={10} query="yo" />;
  })
  .add("error emoji default", () => {
    setValue("features.previewWatch", false);
    return <SearchInputFactory count={0} />;
  })
  .add("error emoji override", () => {
    setValue("features.previewWatch", false);
    return <SearchInputFactory count={0} showErrorEmoji={false} />;
  });
