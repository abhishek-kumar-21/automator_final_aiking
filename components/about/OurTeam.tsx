/** @format */
import Image from "next/image";
import { FaLinkedin } from "react-icons/fa"; // Importing FontAwesome Icon for cleaner look

interface TeamCardProps {
  name: string;
  role: string;
  linkedin: string;
  img: string;
}

const TeamCard = ({ name, role, linkedin, img }: TeamCardProps) => (
  <div className="bg-[#F0F6FF] rounded-[32px] p-8 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
    <div className="relative w-24 h-24 mx-auto mb-6">
      <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-sm">
        <Image
          src={img}
          alt={name}
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
    
    <h3 className="text-xl font-bold text-gray-900 mb-1 font-raleway">
      {name}
    </h3>
    
    <p className="text-sm text-gray-600 font-roboto mb-4">
      {role}
    </p>

    <div className="flex justify-center">
      <a
        href={linkedin}
        target="_blank"
        rel="noreferrer"
        className="text-gray-800 hover:text-[#0077b5] transition-colors duration-200"
      >
        <FaLinkedin size={28} />
      </a>
    </div>
  </div>
);

export default function OurTeam() {
  return (
    <main className="relative overflow-hidden w-full bg-white py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
      
      {/* Decorative Blur Background (Optional - keep subtle if needed, removed for pure white look based on image) */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-blue-50 to-transparent -z-10"></div>

      <div className="max-w-7xl mx-auto">
        {/* Mission Section */}
        <section className="text-center max-w-4xl mx-auto mb-20">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 font-raleway mb-6">
            Jobform Automator’s Mission
          </h1>
          <p className="text-base lg:text-lg text-gray-600 leading-relaxed font-roboto">
            Job Form Automator revolutionizes job applications with AI-powered automation. We empower job seekers to apply to thousands
            of positions on platforms like LinkedIn, Indeed, and Monster efficiently. Our tool auto-fills forms, reduces errors, and saves
            time, providing a seamless experience. Committed to innovation, we help users achieve their career goals faster and more
            effectively.
          </p>
        </section>

        {/* Team Section */}
        <section>
          <h2 className="text-2xl lg:text-3xl font-bold text-center text-gray-900 mb-12 font-raleway">
            Meet our team
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto">
            <TeamCard
              name="Saurabh Belote"
              role="CEO & Founder"
              linkedin="https://www.linkedin.com/in/saurabh-belote/"
              img="/images/image.png"
            />
            <TeamCard
              name="Suman Bera"
              role="Lead Product Engineer"
              linkedin="https://www.linkedin.com/in/suman-bera-816642191/"
              img="/images/image.png"
            />
            <TeamCard
              name="Pawan Kumar"
              role="Software Developer"
              linkedin="https://www.linkedin.com/in/pawan-yadav-022b76266/"
              img="/images/image.png"
            />
          </div>
        </section>
      </div>
    </main>
  );
}
