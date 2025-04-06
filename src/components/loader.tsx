import { GitBranchIcon, GitMergeIcon, GitCommitVerticalIcon } from "lucide-react"
import { useState, useEffect } from "react"

export function Loader() {
  const [currentIcon, setCurrentIcon] = useState(0)
  const [opacity, setOpacity] = useState(1)

  const icons = [GitCommitVerticalIcon, GitBranchIcon, GitMergeIcon]
  const IconComponent = icons[currentIcon]

  useEffect(() => {
    // Single animation cycle
    const animationCycle = () => {
      // Start fade out
      setOpacity(0);

      // After fade out completes, change icon and start fade in
      setTimeout(() => {
        setCurrentIcon((prev) => (prev + 1) % icons.length);
        setTimeout(() => {
          setOpacity(1);
        }, 50); // Small delay to ensure state update has happened
      }, 500); // This should match the CSS transition duration
    };

    // Start the animation cycle
    const interval = setInterval(animationCycle, 2000);

    return () => clearInterval(interval);
  }, [icons.length]);

  return (
    <div className="relative h-8 w-8 flex items-center justify-center">
      <IconComponent
        className="absolute h-8 w-8 transition-opacity duration-500 ease-in-out"
        style={{ opacity }}
      />
    </div>
  )
}
