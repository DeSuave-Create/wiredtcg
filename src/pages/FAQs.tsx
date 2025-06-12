
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContentSection from '@/components/ContentSection';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

const FAQs = () => {
  const faqs = [
    {
      question: "How many players can play WIRED?",
      answer: "WIRED supports 2-5 players. The game is optimized for 3-4 players, but works great with any number in that range. The score keeper tool on our website supports up to 5 players for tracking games."
    },
    {
      question: "How long does a typical game take?",
      answer: "A standard game of WIRED takes 30-45 minutes. Quick games with experienced players can be completed in 20 minutes, while learning games with new players might take up to an hour."
    },
    {
      question: "What's the recommended age for players?",
      answer: "WIRED is recommended for ages 12 and up due to the strategic thinking required. However, younger players who are familiar with technology concepts may enjoy it with some guidance."
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
      answer: "The base game includes 120 cards (40 Computer cards, 40 Wire cards, 40 Switch cards), a game manual, quick-start guide, and score tracking sheets."
    },
    {
      question: "Are there expansion packs available?",
      answer: "Yes! We offer the Network Expansion Pack with routers and servers, and the Security Protocol Pack with cybersecurity elements. More expansions are in development."
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
    },
    {
      question: "What if I lose cards or they get damaged?",
      answer: "Contact our support team through the website. We offer replacement cards for damaged components and can help with missing pieces from new games."
    },
    {
      question: "Are there different difficulty levels?",
      answer: "Yes! The rulebook includes beginner, standard, and advanced rule sets. There are also variant game modes that change the complexity and play style."
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <ContentSection title="Frequently Asked Questions" glowEffect>
          <div className="text-center space-y-4">
            <HelpCircle className="h-16 w-16 text-primary mx-auto animate-pulse" />
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about WIRED, from gameplay mechanics to purchasing information.
            </p>
          </div>
        </ContentSection>

        {/* FAQ Accordion */}
        <ContentSection>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="neon-border bg-card/30 rounded-lg px-6 data-[state=open]:animate-pulse-neon"
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

        {/* Contact Section */}
        <ContentSection title="Still Have Questions?">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex justify-center space-x-4">
              <button className="bg-primary text-primary-foreground hover:bg-primary/80 neon-glow px-6 py-2 rounded font-medium">
                Contact Support
              </button>
              <button className="border border-primary/50 text-primary hover:bg-primary/10 px-6 py-2 rounded font-medium neon-border">
                Join Discord
              </button>
            </div>
          </div>
        </ContentSection>
      </main>

      <Footer />
    </div>
  );
};

export default FAQs;
