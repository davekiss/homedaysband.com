import Footer from './components/Footer';
import Shows from './components/Shows';

export default function Home() {
  return (
    <div className="min-h-screen relative">
      <div className="film-grain"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#a41b77]/10 via-transparent to-[#a41b77]/5 blur-3xl"></div>

      <div className="relative z-10 flex flex-col w-full">
        <div className="flex-1 flex flex-col items-center justify-center min-h-screen">
          <div className="text-center space-y-8 w-full">
            <div className="space-y-4 relative w-full h-[60vh] sm:h-[70vh] md:h-[80vh] flex items-center justify-center">
              <div className="absolute inset-0 -z-10">
                <img
                  src="/images/pond.jpeg"
                  alt="Homedays band"
                  className="w-full h-full object-cover opacity-50"
                />
              </div>
              <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl xl:text-[10rem] uppercase text-[#3a4232]">
                Homedays
              </h1>
            </div>

            <div className="space-y-6 pt-8">
              <div className="flex flex-col items-center space-y-4 w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto">
                <iframe style={{borderRadius: "24px"}} src="https://untitled.stream/embed/ZnROlQlv9Yer" width="100%" height="344" allowFullScreen allow="picture-in-picture" frameBorder="0" loading="lazy"></iframe>
              </div>
            </div>

            <Shows />
          </div>
        </div>

        <Footer />
      </div>

      {/* Ambient blobs removed to let new background color come through */}
    </div>
  );
}
