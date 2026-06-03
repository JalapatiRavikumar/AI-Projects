import React, { useEffect, memo } from "react";
import { GraduationCap, Calendar, MapPin, Award } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

const EducationCard = memo(({ institution, degree, location, gpa, duration, icon: Icon }) => (
  <div
    data-aos="fade-up"
    data-aos-duration="1000"
    className="relative group"
  >
    <div className="relative z-10 bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-white/10 overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl">
      <div className="absolute -z-10 inset-0 bg-gradient-to-br from-[#6366f1]/10 to-[#a855f7]/10 opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r from-[#6366f1] to-[#a855f7] transition-transform group-hover:rotate-6">
          <Icon className="w-6 h-6 text-white" />
        </div>

        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#6366f1] group-hover:to-[#a855f7] transition-all duration-300">
            {institution}
          </h3>
          
          <p className="text-gray-300 mb-2 font-medium">
            {degree}
          </p>

          <div className="space-y-2 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{location}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{duration}</span>
            </div>
            
            {gpa && (
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span>GPA: {gpa}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
));

const EducationPage = () => {
  const educationData = [
    {
      institution: "Santhiram Engineering College",
      degree: "B.Tech — Computer Science & Engineering",
      location: "Nandyal, India",
      gpa: "7.22",
      duration: "2020 — 2024 · Graduated 2024",
      icon: GraduationCap
    },
    {
      institution: "National Junior College",
      degree: "Mathematics",
      location: "Nandyal, India",
      gpa: "60.70",
      duration: "Jun 2019 - Aug 2020",
      icon: GraduationCap
    },
    {
      institution: "ZPHS High School",
      degree: "General",
      location: "Nandyal, India",
      gpa: "8.5",
      duration: "Aug 2017 - Dec 2018",
      icon: GraduationCap
    }
  ];

  useEffect(() => {
    AOS.init({
      once: false,
    });
  }, []);

  return (
    <div className="h-auto pb-[10%] text-white overflow-hidden px-[5%] sm:px-[5%] lg:px-[10%] mt-10 sm-mt-0" id="Education">
      {/* Header */}
      <div className="text-center lg:mb-8 mb-2 px-[5%]">
        <div className="inline-block relative group">
          <h2
            className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]"
            data-aos="zoom-in-up"
            data-aos-duration="600"
          >
            Education
          </h2>
        </div>
        <p
          className="mt-2 text-gray-400 max-w-2xl mx-auto text-base sm:text-lg flex items-center justify-center gap-2"
          data-aos="zoom-in-up"
          data-aos-duration="800"
        >
          My academic journey and qualifications
        </p>
      </div>

      {/* Education Cards */}
      <div className="w-full mx-auto pt-8 sm:pt-12 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {educationData.map((education, index) => (
            <EducationCard
              key={index}
              {...education}
              data-aos-delay={index * 200}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EducationPage;
