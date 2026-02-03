import React, { useCallback, useEffect, useState } from "react";

import { useControlledDialContext } from "~/contexts/ControlledDialContext";

import { SingleSetpoint, ChangeSetpointMutationVariables } from "~/graph";

import { equal } from "~/utils/math";

import StaticDialSingle from "./StaticDial/StaticDialSingle";

export interface ControlledDialProps {
  setpoint: SingleSetpoint;
  temperatureAmbient?: number;
  changeSetpoint: ({
    variables,
  }: {
    variables: ChangeSetpointMutationVariables;
  }) => void;
  allowUpdateFromCache: () => boolean;
}

export default function ControlledDialSingle({
  setpoint,
  changeSetpoint,
  allowUpdateFromCache,
}: ControlledDialProps): JSX.Element {
  const { controllerId } = useControlledDialContext();

  const [targetSetpoint, setTargetSetpoint] = useState(setpoint);

  const onChangeSetpointSingle = useCallback(
    (newTarget: number) => {
      setTargetSetpoint((current) => {
        if (equal(current.value, newTarget)) return current;

        return { ...current, value: newTarget };
      });

      changeSetpoint({
        variables: {
          id: controllerId,
          single: { target: newTarget },
          dual: null,
        },
      });
    },
    [changeSetpoint, controllerId]
  );

  useEffect(() => {
    if (allowUpdateFromCache()) {
      setTargetSetpoint(setpoint);
    }
  }, [allowUpdateFromCache, setpoint]);

  return (
    <StaticDialSingle
      onChange={onChangeSetpointSingle}
      targetSetpoint={targetSetpoint}
    />
  );
}
