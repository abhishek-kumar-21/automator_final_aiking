import Image from "next/image";

const CompaniesSection = () => {
  const companies = [
    { 
      name: "Microsoft", 
      logo: "/images/microsoft.png",
    },
    { 
      name: "Netflix", 
      logo: "/images/netflix.png",
    },
    { 
      name: "Flipkart", 
      logo: "/images/flipkart.png",
    },
    { 
      name: "Swiggy", 
      logo: "/images/swiggy.png",
    },
  ];

  return (
    <section className="bg-white py-12 border-none shadow-none outline-none w-full">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h3 className="text-sm sm:text-lg font-bold text-gray-500 tracking-wider mb-8">
          Get hired by top companies worldwide
        </h3>
        
        <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12 lg:gap-16">
          {companies.map((company, index) => (
            <div 
              key={index} 
              className="relative w-28 sm:w-32 lg:w-36 h-12 flex items-center justify-center transition-transform duration-300 hover:scale-105"
            >
              <Image
                src={company.logo}
                alt={`${company.name} logo`}
                fill
                sizes="(max-width: 640px) 112px, (max-width: 1024px) 128px, 144px"
                priority={index < 2}
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CompaniesSection;