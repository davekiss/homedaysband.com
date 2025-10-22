type Show = {
  date: string;
  venue: string;
  location: string;
  supportingActs?: string[];
  ticketsUrl?: string;
};

const shows: Show[] = [
  {
    date: "October 25, 2025",
    venue: "Bent Mace",
    location: "Cleveland, OH",
    supportingActs: ["Aro Girl", "Nervous Surface", "Detatchi"],
  },
  {
    date: "November 22, 2025",
    venue: "Brothers Lounge",
    location: "Cleveland, OH",
    supportingActs: ["Isles", "Rusted Hearts", "Archangel"],
  }
];

export default function Shows() {
  return (
    <div className="space-y-6 pt-12">
      <h2 className="text-3xl sm:text-4xl font-bold text-center text-[#a41b77] mb-8">Upcoming shows</h2>
      <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4">
        {shows.length > 0 ? (
          <div className="space-y-4 w-full">
            {shows.map((show, index) => (
              <div key={index} className="bg-white/20 backdrop-blur-sm rounded-lg p-6 border border-[#a41b77]/30">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div>
                    <h3 className="text-xl font-semibold text-[#a41b77]">{show.venue}</h3>
                    <p className="text-[#a41b77]">
                      {show.location}
                      {show.supportingActs && show.supportingActs.length > 0 && (
                        <span className="text-[#a41b77]/80 text-sm block sm:inline sm:before:content-['\00a0\2022\00a0']">
                          with {show.supportingActs.join(", ")}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="mt-2 sm:mt-0 flex flex-col items-end">
                    <p className="text-lg font-medium text-[#a41b77]">{show.date}</p>
                    {show.ticketsUrl && (
                      <a
                        href={show.ticketsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 px-4 py-1.5 bg-[#a41b77] hover:bg-[#a41b77]/90 text-white rounded-md text-sm transition-colors duration-200"
                      >
                        Tickets
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xl text-center text-[#a41b77] bg-white/20 backdrop-blur-sm rounded-lg p-8 border border-[#a41b77]/30">Nothing to see here</p>
        )}
      </div>
    </div>
  );
}
