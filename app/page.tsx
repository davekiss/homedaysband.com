import Footer from './components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-pink-50 to-purple-100 relative">
      <div className="film-grain"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-orange-200/30 via-transparent to-pink-200/20 blur-3xl"></div>

      <div className="relative z-10 flex flex-col px-4">
        <div className="flex-1 flex flex-col items-center justify-center min-h-screen">
          <div className="text-center space-y-8 mx-auto">
            <div className="space-y-4">
              <h1 className="bitcount-homedays text-8xl md:text-9xl lg:text-[12rem] uppercase tracking-wider text-transparent bg-gradient-to-r from-orange-600 via-pink-600 to-purple-700 bg-clip-text">
                Homedays
              </h1>
            </div>

            <div className="space-y-6 pt-8">

              <div className="flex flex-col items-center space-y-4">
                      <iframe style={{borderRadius: "24px"}} src="https://untitled.stream/embed/IqcnraRHM0Xo" width="100%" height="192" allowFullScreen allow="picture-in-picture" frameBorder="0" loading="lazy"></iframe>
                      <iframe style={{borderRadius: "24px"}} src="https://untitled.stream/embed/BOjrNRytCE9W" width="100%" height="192" allowFullScreen allow="picture-in-picture" frameBorder="0" loading="lazy"></iframe>
                      <iframe style={{borderRadius: "24px"}} src="https://untitled.stream/embed/UYeblQmbx1gX" width="100%" height="192" allowFullScreen allow="picture-in-picture" frameBorder="0" loading="lazy"></iframe>
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
