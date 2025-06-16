"use client";
import { TypeAnimation } from "react-type-animation";
import { useRouter } from "next/navigation";
import { GiCookingPot, GiMeal, GiChefToque, GiFruitBowl, GiSpoon } from "react-icons/gi";
import { FaLeaf, FaRegLightbulb, FaUtensils } from "react-icons/fa";
import { IoFastFoodOutline } from "react-icons/io5";
import Image from "next/image";

export default function CreativeLanding() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden">
  
      <GiFruitBowl className="absolute top-12 sm:top-20 left-2 sm:left-10 text-blue-200 text-3xl sm:text-6xl rotate-12 opacity-60" />
      <GiSpoon className="absolute bottom-1/4 right-2 sm:right-16 text-indigo-200 text-2xl sm:text-5xl -rotate-45 opacity-50" />
      <FaLeaf className="absolute top-1/3 right-2 sm:right-24 text-green-200 text-xl sm:text-4xl rotate-15 opacity-70" />
      <IoFastFoodOutline className="absolute bottom-16 sm:bottom-20 left-8 sm:left-1/4 text-yellow-200 text-2xl sm:text-5xl -rotate-12 opacity-60" />

      <div className="w-full max-w-2xl text-center space-y-4 sm:space-y-8 relative z-10 px-2">
        <div className="flex justify-center items-center">
  
          <div className="relative w-64 h-32 sm:w-80 sm:h-40 md:w-96 md:h-48">
            <Image 
              src="/logo_home.png" 
              alt="Your Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
        
        <div className="text-lg sm:text-xl text-gray-600 h-20 sm:h-24 flex items-center justify-center gap-2 px-2">
          <TypeAnimation
            sequence={[
              "Bhook lagi hai? AI Chef taiyaar hai! ",
              1000,
              "Jo fridge mein hai, ussi se banega kamaal! ",
              1000,
              "Aaj khana banayega tera digital bawarchi! ",
              1000,
              "Bas ingredients daalo, recipe mil jaayegi! ",
              1000,
              "Swad bhi, tech bhi – asli AI wala tadka! ",
              1000,
            ]}
            wrapper="span"
            speed={50}
            style={{ display: "inline-block" }}
            repeat={Infinity}
            className="font-medium text-sm sm:text-base"
          />
        </div>

        <p className="text-gray-500 mb-6 sm:mb-10 flex items-center justify-center gap-2 text-sm sm:text-base">
          <FaLeaf className="text-green-400" />
          Discover recipes you&apos;d never imagine
          <FaLeaf className="text-green-400" />
        </p>

        <button
          onClick={() => router.push("/login")}
          className="px-6 py-2 sm:px-8 sm:py-3 bg-blue-600 text-white rounded-full text-base sm:text-lg font-medium hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl animate-bounce flex items-center gap-2 mx-auto cursor-pointer hover:scale-105 transform duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <GiCookingPot className="text-xl" /> Get Started ✨
        </button>

        <div className="mt-8 sm:mt-16 text-xs sm:text-sm text-gray-400 flex items-center justify-center gap-2 sm:gap-4">
          <GiSpoon className="text-gray-300 hidden sm:block" />
          <p>No magic wand required - just your appetite</p>
          <GiSpoon className="text-gray-300 hidden sm:block" />
        </div>
      </div>
    </div>
  );
}