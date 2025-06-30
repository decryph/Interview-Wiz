// import { call, watch } from "../assets";

const Generating = ({ className }) => {
  return (
    <div className={`flex justify-between items-center bg-linkedinBlue-800 rounded-2xl px-4 py-2 shadow-lg text-white ${className || ""}`}>
      {/* Left Side */}
      <div className="flex items-center h-14 px-6 bg-linkedinBlue-700 rounded-full text-base font-semibold tracking-wide">
        Next Question
      </div>
      <div className="flex items-center h-14 px-6 bg-linkedinBlue-700 rounded-full">
        <span className="w-10 h-10 ml-4 mr-5 flex items-center justify-center text-2xl">📞</span>
      </div>
      {/* Right Side */}
      <div className="flex items-center h-14 px-6 bg-linkedinBlue-700 rounded-full text-base font-semibold tracking-wide">
        <span className="w-8 h-8 mr-4 flex items-center justify-center text-xl">⏱️</span>
        30:00
      </div>
    </div>
  );
};

export default Generating;
