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
      color: "bg-gradient-to-r from-slate-300 to-slate-500"
    },
    {
      title: "GOLD", 
      description: "Major contributors to the WIRED project",
      members: [],
      color: "bg-gradient-to-r from-yellow-400 to-yellow-600"
    },
    {
      title: "BETA",
      description: "Early supporters and beta testers",
      members: [],
      color: "bg-gradient-to-r from-blue-400 to-blue-600"
    },
    {
      title: "ALPHA",
      description: "Original visionaries and first supporters",
      members: [],
      color: "bg-gradient-to-r from-green-400 to-green-600"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {founderCategories.map((category) => (
                <div key={category.title} className="neon-border rounded-xl p-6 bg-card/50">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge className={`${category.color} text-white font-bold px-4 py-2`}>
                      {category.title}
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">{category.description}</p>
                  
                  <div className="min-h-[100px] flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                    <p className="text-muted-foreground text-sm">
                      Founders will be listed here soon
                    </p>
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