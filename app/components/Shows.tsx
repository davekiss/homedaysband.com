type Show = {
  date: string;
  venue: string;
  location: string;
};

const shows: Show[] = [
  // Add show objects here with properties like date, venue, location, etc.
  // Example:
  // { date: "2024-09-15", venue: "The Local Bar", location: "Portland, OR" },
  // { date: "2024-09-22", venue: "Main Street Venue", location: "Seattle, WA" },
];

export default function Shows() {
  return (
    <div className="space-y-6 pt-12">
      <h2 className="text-3xl sm:text-4xl font-bold text-center text-orange-600 mb-8">Upcoming shows</h2>
      <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4">
        {shows.length > 0 ? (
          <div className="space-y-4 w-full">
            {shows.map((show, index) => (
              <div key={index} className="bg-white/20 backdrop-blur-sm rounded-lg p-6 border border-orange-200/30 shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div>
                    <h3 className="text-xl font-semibold text-orange-700">{show.venue}</h3>
                    <p className="text-orange-600">{show.location}</p>
                  </div>
                  <div className="mt-2 sm:mt-0">
                    <p className="text-lg font-medium text-orange-800">{show.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xl text-center text-orange-600 bg-white/20 backdrop-blur-sm rounded-lg p-8 border border-orange-200/30">Nothing to see here</p>
        )}
      </div>
    </div>
  );
}