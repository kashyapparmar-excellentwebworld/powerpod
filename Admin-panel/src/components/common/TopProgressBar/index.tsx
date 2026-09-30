import { LinearProgress } from "@mui/material";

export const TopProgressBar = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <LinearProgress
        color="primary"
        sx={{
          height: 3,
          "& .MuiLinearProgress-bar": {
            transition: "transform 0.2s linear",
          },
        }}
      />
    </div>
  );
};
