/*
 * Ellipsisable element with tooltip.
 */

import * as React from "react";
import SimpleTooltip from "./simpleTooltip";

// ---------------------------------------------------------------------------------------------------------------------------------

// TODO sort out style stuff.

const ellipsisDefaultStyle: React.CSSProperties = {
    overflow: "hidden",
    overflowWrap: "break-word",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    wordBreak: "break-all"
};

interface Props {
    style?: React.CSSProperties;
}

interface State {
    isOverflowing: boolean;
}

class EllipsisWithTooltip extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            isOverflowing: false
        };
    }

    render() {
        const { style = {} } = this.props;
        const ellipsisStyle = { ...ellipsisDefaultStyle, ...style };

        if (this.state.isOverflowing && this.ref.current && this.ref.current.textContent) {
            return (
                <SimpleTooltip text={this.ref.current.textContent}>
                    <div style={ellipsisStyle}>{this.props.children}</div>
                </SimpleTooltip>
            );
        } else {
            return (
                <div ref={this.ref} style={ellipsisStyle} onMouseEnter={this.onMouseEnter}>
                    {this.props.children}
                </div>
            );
        }
    }

    private readonly onMouseEnter = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const element = e.currentTarget;

        if (!this.state.isOverflowing && element.scrollWidth > element.clientWidth) {
            this.setState({ isOverflowing: true });
        } else {
            this.setState({ isOverflowing: false });
        }
    };

    private readonly ref = React.createRef<HTMLDivElement>();
}

export default EllipsisWithTooltip;
