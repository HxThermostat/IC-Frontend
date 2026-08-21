import React from "react";

import ActivityIndicator from "~/components/ActivityIndicator";
import Box from "~/components/Box";
import { CheckmarkIcon } from "~/components/Icons";

interface ListItemCheckmarkProps {
  checked?: boolean;
  loading?: boolean;
  position?: "left" | "right";
}

const ListItemCheckmark = ({
  checked,
  loading,
  position = "left",
}: ListItemCheckmarkProps): JSX.Element => {
  const shouldShowCheckmark = !!checked;

  return (
    <Box
      paddingLeft={position === "right" ? "m" : undefined}
      paddingRight={position === "left" ? "m" : undefined}
      width={32}
    >
      {loading && <ActivityIndicator size={16} />}
      {!loading && shouldShowCheckmark && (
        <CheckmarkIcon color="text" size={16} />
      )}
    </Box>
  );
};

export default ListItemCheckmark;
