
import NetworkLogo from './NetworkLogo';

interface LogoProps {
  className?: string;
  size?: number;
}

const Logo = ({ className = "", size = 32 }: LogoProps) => {
  return <NetworkLogo className={className} size={size} />;
};

export default Logo;
