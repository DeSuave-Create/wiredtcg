
import TextSection from '@/components/TextSection';

const StrategySection = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
      <TextSection title="Strategic Depth" accent>
        <div className="text-center space-y-2">
          <p className="text-sm sm:text-base">Every decision matters in WIRED. Choose your strategy wisely.</p>
          <p className="text-sm sm:text-base">Do you want to focus on expanding or attacking?</p>
          <p className="text-sm sm:text-base">Form temporary alliances with other players and come up with your own strategy.</p>
        </div>
      </TextSection>
      <TextSection title="Multiple Paths to Victory">
        <div className="text-center">
          <p className="text-sm sm:text-base">Build the ultimate mining operation, sabotage your competitors' networks, or become the dealmaker who controls the flow of resources. Each game offers different strategies for reaching the target score first.</p>
        </div>
      </TextSection>
    </div>
  );
};

export default StrategySection;
