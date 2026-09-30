export const ChartSkeleton = () => {
  return (
    <div className="w-full h-full flex flex-col space-y-4 animate-pulse p-4">
      <div className="flex-1 bg-gray-100/50 rounded-2xl relative overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-gray-200/50 to-transparent" />
        <div className="absolute inset-0 flex items-end justify-around px-4 pb-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="w-8 bg-gray-200/50 rounded-t-lg"
              style={{ height: `${Math.random() * 60 + 20}%` }}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-around pt-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-2 w-12 bg-gray-100 rounded-full" />
        ))}
      </div>
    </div>
  );
};
