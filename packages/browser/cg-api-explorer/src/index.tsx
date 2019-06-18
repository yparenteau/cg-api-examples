/*
 * cg-api-explorer main application entry point.
 */

import * as React from "react";
import ReactDOM from "react-dom";
import App from "./App";

import "index.scss";
import "@fortawesome/fontawesome-free/css/all.css";

// const whyDidYouRender = require("@welldone-software/why-did-you-render/dist/no-classes-transpile/umd/whyDidYouRender.min.js");
// whyDidYouRender(React, { logOnDifferentValues: true });

// ---------------------------------------------------------------------------------------------------------------------------------

ReactDOM.render(<App />, document.getElementById("root"));
