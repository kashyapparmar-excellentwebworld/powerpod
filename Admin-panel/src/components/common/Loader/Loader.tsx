import { CircularProgress } from "@mui/material";

interface LoaderProps {
  small?: boolean;
  size?: string | number;
  className?: string;
}

const Loader = ({ small = false, size, className = "" }: LoaderProps) => {
  if (small) {
    return (
      <CircularProgress
        size={size || 20}
        color="inherit"
        className={className}
      />
    );
  }

  return (
    <div
      className={`flex justify-center items-center min-h-[400px] w-full ${className}`}
    >
      <CircularProgress size={size || 40} color="primary" />
    </div>
  );
};

export default Loader;
