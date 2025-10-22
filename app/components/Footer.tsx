export default function Footer() {
  return (
    <footer className="relative z-20 p-6 mt-16">
      <div className="flex justify-center">
        <a
          href="https://instagram.com/homedaysband"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all duration-200 group"
          aria-label="Follow Homedays on Instagram"
        >
          <img
            src="/images/ig.svg"
            alt="Instagram"
            className="w-6 h-6 opacity-90 group-hover:opacity-75 transition-opacity duration-200"
          />
        </a>
      </div>
    </footer>
  );
}
