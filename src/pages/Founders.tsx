import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContentSection from '@/components/ContentSection';
import { Badge } from '@/components/ui/badge';

const Founders = () => {
  const founderCategories = [
    {
      title: "PLATINUM",
      description: "Premier supporters who made WIRED possible",
      members: [],
      borderColor: "border-purple-500 shadow-purple-500/50",
      glowColor: "shadow-[0_0_20px_rgba(168,85,247,0.5)]",
      textColor: "text-purple-400",
      bgGradient: "bg-gradient-to-br from-purple-900/20 to-purple-800/10",
      accessId: "#WTCG-PT-2017",
      clearance: "CLASS III"
    },
    {
      title: "GOLD", 
      description: "Major contributors to the WIRED project",
      members: [],
      borderColor: "border-yellow-500 shadow-yellow-500/50",
      glowColor: "shadow-[0_0_20px_rgba(234,179,8,0.5)]",
      textColor: "text-yellow-400",
      bgGradient: "bg-gradient-to-br from-yellow-900/20 to-yellow-800/10",
      accessId: "#WTCG-GD-0217",
      clearance: "CLASS III"
    },
    {
      title: "BETA",
      description: "Early supporters and beta testers",
      members: [],
      borderColor: "border-green-500 shadow-green-500/50",
      glowColor: "shadow-[0_0_20px_rgba(34,197,94,0.5)]",
      textColor: "text-green-400",
      bgGradient: "bg-gradient-to-br from-green-900/20 to-green-800/10",
      accessId: "#WTCG-BT-0217",
      clearance: "CLASS III"
    },
    {
      title: "ALPHA",
      description: "Original visionaries and first supporters",
      members: [],
      borderColor: "border-cyan-500 shadow-cyan-500/50",
      glowColor: "shadow-[0_0_20px_rgba(6,182,212,0.5)]",
      textColor: "text-cyan-400",
      bgGradient: "bg-gradient-to-br from-cyan-900/20 to-cyan-800/10",
      accessId: "#WTCG-AL-0217",
      clearance: "CLASS III"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 flex justify-center flex-grow">
        <div className="w-full max-w-6xl space-y-8">
          
          <ContentSection title="FOUNDERS" glowEffect>
            <div className="text-center mb-8">
              <p className="text-lg text-muted-foreground">
                Honoring the visionaries who helped bring WIRED to life through their generous support.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                This page will be updated as our Kickstarter campaign progresses.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {founderCategories.map((category) => (
                <div 
                  key={category.title} 
                  className={`relative rounded-2xl border-2 ${category.borderColor} ${category.glowColor} backdrop-blur-sm transition-all duration-300 hover:scale-105`}
                  style={{
                    backgroundImage: `url('/lovable-uploads/1c401f60-09cd-4ef4-ab16-66ae92fa73bc.png')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                >
                  {/* Dark overlay for better text readability */}
                  <div className={`absolute inset-0 rounded-2xl ${category.bgGradient} opacity-90`}></div>
                  
                  <div className="relative z-10">
                    {/* Card Header */}
                    <div className="p-6 border-b border-gray-700/50">
                      <div className="text-center mb-4">
                        <h3 className="text-sm font-mono text-gray-400 tracking-wider mb-2">FOUNDER</h3>
                        <h2 className="text-sm font-mono text-gray-400 tracking-wider">ACCESS</h2>
                      </div>
                      
                      {/* Icon/Symbol */}
                      <div className="flex justify-center mb-4">
                        <div className={`w-12 h-12 rounded border-2 ${category.borderColor} ${category.bgGradient} flex items-center justify-center`}>
                          <span className={`text-xl font-bold ${category.textColor}`}>
                            {category.title.charAt(0)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 space-y-4">
                      <div className="text-center">
                        <p className="text-xs font-mono text-gray-400 mb-1">TIER:</p>
                        <h3 className={`text-2xl font-bold ${category.textColor} tracking-wider font-mono`}>
                          {category.title}
                        </h3>
                      </div>

                      <div className="space-y-3 text-xs font-mono">
                        <div>
                          <span className="text-gray-400">ACCESS ID:</span>
                          <p className={`${category.textColor} font-bold`}>{category.accessId}</p>
                        </div>
                        
                        <div>
                          <span className="text-gray-400">CLEARANCE LEVEL:</span>
                          <p className={`${category.textColor} font-bold`}>{category.clearance}</p>
                        </div>
                        
                        <div>
                          <span className="text-gray-400">AUTHORIZED FOR:</span>
                          <div className={`${category.textColor} space-y-1 mt-1`}>
                            <p>✦ DEV NETWORK ENTRY</p>
                            <p>✦ DECK BUILD PROTOTYPING</p>
                            <p>✦ WIRED OPS CHAT</p>
                          </div>
                        </div>
                      </div>

                      {/* Founders List */}
                      <div className="mt-6 pt-4 border-t border-gray-700/50">
                        <div className="min-h-[60px] flex items-center justify-center">
                          <p className="text-gray-500 text-xs font-mono">
                            FOUNDERS WILL BE LISTED HERE SOON
                          </p>
                        </div>
                      </div>

                      {/* QR Code Placeholder */}
                      <div className="flex justify-center mt-4">
                        <div className={`w-16 h-16 border ${category.borderColor} ${category.bgGradient} rounded flex items-center justify-center`}>
                          <div className="grid grid-cols-4 gap-0.5">
                            {Array.from({ length: 16 }).map((_, i) => (
                              <div 
                                key={i} 
                                className={`w-1 h-1 ${Math.random() > 0.5 ? `bg-current ${category.textColor}` : 'bg-transparent'}`} 
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8 p-6 neon-border rounded-xl bg-primary/10">
              <h3 className="text-xl font-bold text-primary mb-2">Want to become a Founder?</h3>
              <p className="text-muted-foreground">
                Stay tuned for our upcoming Kickstarter campaign where you can support WIRED and earn your place among our founding supporters.
              </p>
            </div>
          </ContentSection>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Founders;