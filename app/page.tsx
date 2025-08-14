import Footer from './components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-pink-50 to-purple-100 relative">
      <div className="film-grain"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-orange-200/30 via-transparent to-pink-200/20 blur-3xl"></div>

      <div className="relative z-10 flex flex-col w-full">
        <div className="flex-1 flex flex-col items-center justify-center min-h-screen">
          <div className="text-center space-y-8 w-full">
            <div className="space-y-4 relative w-full h-[60vh] sm:h-[70vh] md:h-[80vh] flex items-center justify-center">
              <div className="absolute inset-0 -z-10">
                <img
                  src="/ride.jpg"
                  alt="Homedays band"
                  className="w-full h-full object-cover opacity-50"
                />
              </div>
              <h1 className="bitcount-homedays text-5xl sm:text-6xl md:text-8xl lg:text-9xl xl:text-[12rem] uppercase tracking-wider text-transparent bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 bg-clip-text drop-shadow-[0_0_30px_rgba(255,165,0,0.5)] animate-pulse mix-blend-screen">
                Homedays
              </h1>
            </div>

            <div className="space-y-6 pt-8">
              <div className="flex flex-col items-center space-y-4 w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto">
                <iframe style={{borderRadius: "24px"}} src="https://untitled.stream/embed/ZnROlQlv9Yer" width="100%" height="344" allowFullScreen allow="picture-in-picture" frameBorder="0" loading="lazy"></iframe>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>

      <div className="absolute top-20 left-10 w-32 h-32 bg-pink-300/20 rounded-full blur-xl"></div>
      <div className="absolute top-40 right-20 w-24 h-24 bg-purple-300/20 rounded-full blur-xl"></div>
      <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-orange-300/20 rounded-full blur-xl"></div>
    </div>
  );
}
