
import TextSection from '@/components/TextSection';

const StrategySection = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-secondary text-center">Strategic Depth</h3>
        <div className="text-center text-muted-foreground leading-relaxed">
          <p className="text-sm sm:text-base">Every decision matters in WIRED. Choose your strategy wisely. Do you want to focus on expanding or attacking? Form temporary alliances with other players and come up with your own strategy.</p>
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-blue-600 text-center">Multiple Paths to Victory</h3>
        <div className="text-center text-muted-foreground leading-relaxed">
          <p className="text-sm sm:text-base">Build the ultimate mining operation, sabotage your competitors' networks, or become the dealmaker who controls the flow of resources. Each game offers different strategies for reaching the target score first.</p>
        </div>
      </div>
    </div>
  );
};

export default StrategySection;
