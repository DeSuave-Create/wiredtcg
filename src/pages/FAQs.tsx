import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContentSection from '@/components/ContentSection';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import ConnectionLines from '@/components/ConnectionLines';
import { HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const FAQs = () => {
  const { toast } = useToast();

  const handleContactSupport = () => {
    toast({
      title: "Support Contact",
      description: "Our support team will get back to you within 24 hours!",
    });
  };

  const handleJoinDiscord = () => {
    toast({
      title: "Discord Community",
      description: "Join our growing community for tips, tournaments, and more!",
    });
  };

  const faqs = [
    {
      question: "How many players can play WIRED?",
      answer: "WIRED supports 1-6 players. The game has different modes: 1-2 for AI, 2-6 for Internet and 4-6 for Botnet."
    },
    {
      question: "How long does a typical game take?",
      answer: "2-3 Player is 5-10 minutes, 4-6 Player is 20-30 minutes."
    },
    {
      question: "What's the recommended age for players?",
      answer: "WIRED is recommended for ages 8 and up due to the strategic thinking required. However, younger players who are familiar with technology concepts may enjoy it with some guidance."
    },
    {
      question: "Do I need IT knowledge to play?",
      answer: "Not at all! While the theme is IT-based, the game mechanics are accessible to everyone. The technology theme adds flavor, but the game is really about strategic card play and network building."
    },
    {
      question: "Can I play WIRED online or digitally?",
      answer: "Currently, WIRED is a physical card game only. However, you can use our online score keeper to track games, and we're exploring digital versions for the future."
    },
    {
      question: "What comes in the base game box?",
      answer: "146 cards plus an informational card only."
    },
    {
      question: "Are there expansion packs available?",
      answer: "They are in development and coming soon."
    },
    {
      question: "How do I win the game?",
      answer: "Victory conditions depend on the game mode, but typically involve completing network connections, controlling key network nodes, or reaching a target score through successful system deployments."
    },
    {
      question: "Can I mix different expansion packs?",
      answer: "Absolutely! All WIRED expansions are designed to work together. Mixing expansions creates more complex and varied gameplay experiences."
    },
    {
      question: "Is there a tournament scene for WIRED?",
      answer: "We're building a competitive community! Check our Discord for local tournaments and online competitions. Official tournament rules are available in the extras section."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex justify-center flex-grow">
        <div className="w-full max-w-4xl">
          {/* Page Header */}
          <ContentSection title="Frequently Asked Questions" glowEffect>
            <div className="text-center space-y-4">
              <HelpCircle className="h-16 w-16 text-primary mx-auto animate-pulse" />
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Find answers to common questions about WIRED, from gameplay mechanics to purchasing information.
              </p>
            </div>
          </ContentSection>
          
          {/* Connection Animation */}
          <ConnectionLines className="my-2" />

          {/* FAQ Accordion */}
          <ContentSection>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-gray-100 rounded-3xl px-6 shadow-2xl drop-shadow-lg data-[state=open]:animate-pulse-neon"
                >
                  <AccordionTrigger className="text-left font-semibold text-primary hover:text-primary/80">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ContentSection>

          {/* Connection Animation */}
          <ConnectionLines className="my-2" />

          {/* Contact Section */}
          <ContentSection title="Still Have Questions?">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <div className="flex justify-center space-x-4">
                <button 
                  onClick={handleContactSupport}
                  className="bg-gray-100 rounded-3xl text-primary hover:bg-gray-200 neon-glow px-6 py-2 font-medium shadow-2xl drop-shadow-lg"
                >
                  Contact Support
                </button>
                <button 
                  onClick={handleJoinDiscord}
                  className="bg-gray-100 rounded-3xl text-primary hover:bg-gray-200 px-6 py-2 font-medium shadow-2xl drop-shadow-lg"
                >
                  Join Discord
                </button>
              </div>
            </div>
          </ContentSection>
          
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQs;
