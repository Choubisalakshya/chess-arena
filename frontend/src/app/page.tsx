// "use client";

// import Link from "next/link";

// export default function Home() {
//   return (
//     <div
//       className="relative min-h-screen flex flex-col items-center justify-center text-white overflow-hidden"
//       style={{
//         backgroundImage: "url('/images/chess-bg.jpg')", // 🧩 Add your image in /public/images/chess-bg.jpg
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//       }}
//     >
//       {/* Overlay for better readability */}
//       <div className="absolute inset-0 bg-black/60"></div>

//       {/* Main Content */}
//       <div className="relative z-10 text-center space-y-8 px-6">
//         <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight animate-fadeIn">
//           Enter the <span className="text-yellow-400">Chess Arena</span>
//         </h1>

//         <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-300 leading-relaxed animate-fadeIn delay-100">
//           Master every move, outsmart your opponent, and rise through the ranks in a battle of strategy and intellect.  
//           <br />The board awaits your first move ♟️
//         </p>

//         <Link
//           href="/game"
//           className="inline-block mt-6 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-500 
//                      text-black font-bold px-10 py-4 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300"
//         >
//           Start a Match
//         </Link>
//       </div>

//       {/* Floating Chess Pieces (Optional aesthetic) */}
//       <div className="absolute bottom-10 flex gap-4 text-5xl text-white/20 animate-fadeIn delay-200">
//         <span>♔</span>
//         <span>♕</span>
//         <span>♖</span>
//         <span>♘</span>
//         <span>♗</span>
//         <span>♙</span>
//       </div>

//       {/* Footer */}
//       <footer className="relative z-10 mt-auto py-6 text-gray-400 text-sm text-center">
//         © {new Date().getFullYear()} Chess Arena — The Game of Infinite Possibilities
//       </footer>

//       {/* Animations */}
//       <style jsx>{`
//         .animate-fadeIn {
//           opacity: 0;
//           animation: fadeIn 1.2s forwards;
//         }
//         .animate-fadeIn.delay-100 {
//           animation-delay: 0.3s;
//         }
//         .animate-fadeIn.delay-200 {
//           animation-delay: 0.6s;
//         }
//         @keyframes fadeIn {
//           to {
//             opacity: 1;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }


// "use client";

// import Link from "next/link";

// export default function Home() {
//   return (
//     <div
//       className="relative min-h-screen flex flex-col items-center justify-center text-white overflow-hidden"
//       style={{
//         backgroundImage: "url('/images/chess-bg.jpg')",
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//       }}
//     >
//       {/* Overlay */}
//       <div className="absolute inset-0 bg-black/70"></div>

//       {/* Main Content */}
//       <div className="relative z-10 text-center space-y-8 px-6">

//         <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight">
//           Enter the <span className="text-yellow-400">Chess Arena</span>
//         </h1>

//         <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-300">
//           Master strategy, challenge opponents, and dominate the board ♟️
//         </p>

//         {/* Buttons */}
//         <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">

//           {/* Signup */}
//           <Link
//             href="/signup"
//             className="
//               bg-yellow-500 hover:bg-yellow-600
//               text-black font-bold
//               px-8 py-4 rounded-xl
//               shadow-xl transition
//             "
//           >
//             Get Started
//           </Link>

//           {/* Signin */}
//           <Link
//             href="/signin"
//             className="
//               border border-white/40
//               hover:bg-white hover:text-black
//               px-8 py-4 rounded-xl
//               font-semibold transition
//             "
//           >
//             Already Registered?
//           </Link>

//         </div>
//       </div>

//       {/* Footer */}
//       <footer className="relative z-10 mt-auto py-6 text-gray-400 text-sm">
//         © {new Date().getFullYear()} Chess Arena
//       </footer>
//     </div>
//   );
// }

"use client";

import Link from "next/link";

export default function Home() {

  return (

    <div
      className="
        relative
        min-h-screen
        overflow-hidden
        text-white
        bg-black
      "
    >

      {/* ================= BACKGROUND IMAGE ================= */}
      <div
        className="
          absolute inset-0
          bg-cover bg-center scale-105
        "
        style={{
          backgroundImage:
            "url('/images/chess-bg.jpg')",
        }}
      />

      {/* ================= DARK OVERLAY ================= */}
      <div
        className="
          absolute inset-0
          bg-black/75
          backdrop-blur-[2px]
        "
      />

      {/* ================= GLOW EFFECTS ================= */}
      <div className="absolute top-[-120px] left-[-120px] w-[320px] h-[320px] bg-yellow-500/20 rounded-full blur-3xl" />

      <div className="absolute bottom-[-120px] right-[-120px] w-[320px] h-[320px] bg-orange-500/20 rounded-full blur-3xl" />


      {/* ================= NAVBAR ================= */}
      <nav
        className="
          relative z-20
          flex items-center justify-between
          px-6 md:px-12
          py-6
        "
      >

        <div className="flex items-center gap-3">

          <div
            className="
              w-12 h-12
              rounded-xl
              bg-yellow-500
              flex items-center justify-center
              text-black text-2xl
              shadow-lg
            "
          >
            ♟️
          </div>

          <div>
            <h1 className="text-2xl font-extrabold">
              Chess Arena
            </h1>

            <p className="text-gray-400 text-sm">
              Battle of Minds
            </p>
          </div>

        </div>


        <div className="flex gap-4">

          <Link
            href="/signin"
            className="
              px-5 py-2.5
              border border-white/20
              rounded-xl
              hover:bg-white hover:text-black
              transition-all duration-300
              font-semibold
            "
          >
            Sign In
          </Link>

          <Link
            href="/signup"
            className="
              px-5 py-2.5
              rounded-xl
              bg-gradient-to-r
              from-yellow-400
              to-yellow-600
              text-black
              font-bold
              hover:scale-105
              transition-all duration-300
              shadow-lg
            "
          >
            Get Started
          </Link>

        </div>

      </nav>


      {/* ================= HERO SECTION ================= */}
      <section
        className="
          relative z-10
          flex flex-col
          items-center justify-center
          text-center
          px-6
          pt-16
          pb-20
        "
      >

        {/* Badge */}
        <div
          className="
            mb-8
            px-5 py-2
            rounded-full
            border border-yellow-500/30
            bg-yellow-500/10
            text-yellow-300
            text-sm
            font-medium
            backdrop-blur-md
            animate-pulse
          "
        >
          ♛ Real-Time Multiplayer Chess Experience
        </div>


        {/* Main Heading */}
        <h1
          className="
            text-5xl
            sm:text-6xl
            md:text-7xl
            lg:text-8xl
            font-black
            leading-tight
            tracking-tight
            max-w-6xl
          "
        >
          Master The
          <span
            className="
              block
              text-transparent
              bg-clip-text
              bg-gradient-to-r
              from-yellow-300
              via-yellow-500
              to-orange-500
            "
          >
            Ultimate Chess Arena
          </span>
        </h1>


        {/* Description */}
        <p
          className="
            mt-8
            max-w-3xl
            text-lg
            md:text-xl
            text-gray-300
            leading-relaxed
          "
        >
          Enter a world where strategy, precision,
          and intelligence collide.
          Challenge real opponents in live multiplayer battles,
          sharpen your tactics,
          and rise through the ranks of elite chess masters.
        </p>


        {/* Buttons */}
        <div
          className="
            mt-12
            flex flex-col sm:flex-row
            gap-5
          "
        >

          <Link
            href="/signup"
            className="
              px-10 py-5
              rounded-2xl
              bg-gradient-to-r
              from-yellow-400
              to-yellow-600
              text-black
              font-bold text-lg
              hover:scale-105
              transition-all duration-300
              shadow-2xl
            "
          >
            Start Playing ♟️
          </Link>


          <Link
            href="/signin"
            className="
              px-10 py-5
              rounded-2xl
              border border-white/20
              bg-white/5
              backdrop-blur-md
              text-white
              font-semibold text-lg
              hover:bg-white hover:text-black
              transition-all duration-300
            "
          >
            Already Registered?
          </Link>

        </div>


        {/* Floating Chess Pieces */}
        <div
          className="
            mt-20
            flex flex-wrap
            justify-center
            gap-6
            text-6xl
            text-white/20
          "
        >
          <span className="hover:scale-125 transition">♔</span>
          <span className="hover:scale-125 transition">♕</span>
          <span className="hover:scale-125 transition">♖</span>
          <span className="hover:scale-125 transition">♘</span>
          <span className="hover:scale-125 transition">♗</span>
          <span className="hover:scale-125 transition">♙</span>
        </div>

      </section>


      {/* ================= FEATURES ================= */}
      <section
        className="
          relative z-10
          px-6 md:px-16
          pb-24
        "
      >

        <div
          className="
            grid
            md:grid-cols-3
            gap-8
            max-w-7xl
            mx-auto
          "
        >

          {/* Card 1 */}
          <div
            className="
              p-8
              rounded-3xl
              bg-white/5
              border border-white/10
              backdrop-blur-lg
              hover:translate-y-[-6px]
              transition-all duration-300
            "
          >

            <div className="text-5xl mb-5">
              ⚡
            </div>

            <h3 className="text-2xl font-bold mb-4">
              Real-Time Matches
            </h3>

            <p className="text-gray-300 leading-relaxed">
              Play instant multiplayer chess games
              with live move synchronization powered
              by WebSockets.
            </p>

          </div>


          {/* Card 2 */}
          <div
            className="
              p-8
              rounded-3xl
              bg-white/5
              border border-white/10
              backdrop-blur-lg
              hover:translate-y-[-6px]
              transition-all duration-300
            "
          >

            <div className="text-5xl mb-5">
              🔐
            </div>

            <h3 className="text-2xl font-bold mb-4">
              Secure Authentication
            </h3>

            <p className="text-gray-300 leading-relaxed">
              JWT authentication with protected game
              routes and secure user sessions.
            </p>

          </div>


          {/* Card 3 */}
          <div
            className="
              p-8
              rounded-3xl
              bg-white/5
              border border-white/10
              backdrop-blur-lg
              hover:translate-y-[-6px]
              transition-all duration-300
            "
          >

            <div className="text-5xl mb-5">
              🏆
            </div>

            <h3 className="text-2xl font-bold mb-4">
              Competitive Gameplay
            </h3>

            <p className="text-gray-300 leading-relaxed">
              Outsmart your opponents, track move history,
              and dominate the battlefield with strategy.
            </p>

          </div>

        </div>

      </section>


      {/* ================= FOOTER ================= */}
      <footer
        className="
          relative z-10
          border-t border-white/10
          py-8
          text-center
          text-gray-400
        "
      >

        <p className="text-lg">
          ♟️ Chess Arena
        </p>

        <p className="mt-2 text-sm">
          © {new Date().getFullYear()} Chess Arena —
          The Game of Infinite Strategy
        </p>

      </footer>

    </div>
  );
}