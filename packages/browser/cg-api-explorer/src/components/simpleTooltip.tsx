/*
 * Common tooltip component for the app.
 */

import * as React from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import uuid from "uuid/v4";

import reactHtmlParse from "html-react-parser";

// ---------------------------------------------------------------------------------------------------------------------------------

interface Props {
    text: string;
}

class SimpleTooltip extends React.PureComponent<Props> {
    render() {
        return (
            <OverlayTrigger
                // Crazy flicker without placement prop, even though optional.
                placement="auto"
                delay={{ show: 500, hide: 100 }}
                overlay={<Tooltip id={this.tooltipId}>{reactHtmlParse(this.props.text)}</Tooltip>}
            >
                {this.props.children}
            </OverlayTrigger>
        );
    }

    private readonly tooltipId = uuid();
}

export default SimpleTooltip;
