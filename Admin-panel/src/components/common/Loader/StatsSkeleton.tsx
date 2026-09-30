import { useTheme } from "@mui/material";

export const StatsSkeleton = ({ count }: { count: number }) => {
    const theme = useTheme();
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {[...Array(count)].map((_, i) => (
                <div
                    key={i}
                    className="rounded-2xl p-4 animate-pulse"
                    style={{ backgroundColor: theme.palette.background.paper }}
                >
                    <div className="flex justify-between items-start mb-3">
                        <div className="p-2 rounded-lg bg-gray-200 h-8 w-8"></div>
                        <div className="h-5 w-10 bg-gray-100 rounded-full"></div>
                    </div>
                    <div>
                        <div className="h-6 w-20 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 w-28 bg-gray-100 rounded"></div>
                    </div>
                </div>
            ))}
        </div>
    );
};
