
import TextSection from '@/components/TextSection';

const StrategySection = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
      <TextSection title="Strategic Depth" accent>
        <p className="text-sm sm:text-base">Every decision matters in WIRED. Choose your strategy wisely.</p>
        <p className="text-sm sm:text-base">Do you want to focus on expanding or attacking?</p>
        <p className="text-sm sm:text-base">Form temporary alliances with other players and come up with your own strategy.</p>
      </TextSection>
      <TextSection title="Multiple Paths to Victory">
        <p className="text-sm sm:text-base">Build the ultimate mining operation, sabotage your competitors' networks, or become the dealmaker who controls the flow of resources. Each game offers different strategies for reaching the target score first.</p>
      </TextSection>
    </div>
  );
};

export default StrategySection;
