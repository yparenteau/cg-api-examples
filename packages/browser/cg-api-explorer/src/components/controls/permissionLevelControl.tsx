/*
 * Permission level radio control.
 */

import * as React from "react";
import ToggleButton from "react-bootstrap/ToggleButton";
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";
import uuid from "uuid/v4";

import { PermissionLevel } from "@activfinancial/cg-api";

// ---------------------------------------------------------------------------------------------------------------------------------

namespace PermissionLevelControl {
    // State to be lifted up elsewhere.
    export interface LiftedState {
        permissionLevel: PermissionLevel;
    }

    interface Props {
        size?: "sm" | "lg";
        variant?: string;
        permissionLevel: PermissionLevel;
        disableBest?: boolean;
        onChange: (permissionLevel: PermissionLevel) => void;
    }

    export class Component extends React.PureComponent<Props> {
        render() {
            return (
                <ToggleButtonGroup
                    toggle
                    vertical
                    type="radio"
                    className="btn-block"
                    name={this.id}
                    value={this.props.permissionLevel}
                    onChange={this.props.onChange}
                >
                    {!this.props.disableBest && (
                        <ToggleButton variant={this.props.variant} size={this.props.size} value={PermissionLevel.default}>
                            Best allowed
                        </ToggleButton>
                    )}

                    <ToggleButton variant={this.props.variant} size={this.props.size} value={PermissionLevel.realtime}>
                        Realtime
                    </ToggleButton>

                    <ToggleButton variant={this.props.variant} size={this.props.size} value={PermissionLevel.delayed}>
                        Delayed
                    </ToggleButton>
                </ToggleButtonGroup>
            );
        }

        private readonly id = uuid();
    }
}

export default PermissionLevelControl;
