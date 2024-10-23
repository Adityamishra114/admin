import { assets } from "../../assets/assets";
import "./Home.css";
const Homepage = () => {
  return (
    <div className="relative min-h-screen w-full bg-slate-700 flex justify-center items-center">
    <video
      autoPlay
      loop
      muted
      className="absolute top-0 left-0 w-full h-full object-cover"
    >
      <source src={assets.video} type="video/mp4" />
    </video>
    <div className="relative z-10 flex justify-center items-center bg-black bg-opacity-50 min-h-screen w-full">
      <h1 className="text-white text-3xl md:text-4xl lg:text-5xl text-center">
        Welcome to the Homepage!
      </h1>
    </div>
  </div>
  
  );
};

export default Homepage;
