import * as React from "react";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { DateTime } from "luxon";

const BasicDateTimePicker = ({ className, value, onChange, ...props }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <DateTimePicker
        className={className}
        value={value ? DateTime.fromISO(value) : null}
        onChange={(newValue) => {
          onChange({
            target: {
              name: props.name,
              value: newValue ? newValue.toISO() : null,
            },
          });
        }}
        
        format="dd MMMM, yyyy hh:mm a"
        {...props}
      />
    </LocalizationProvider>
  );
};

export default BasicDateTimePicker;
