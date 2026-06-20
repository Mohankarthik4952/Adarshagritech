import { useMemo } from "react";
const Greeting = ({ name }) => {
  const displayName = useMemo(() => {
    if (name && name.trim()) {
      return name.trim();
    }
    try {
      const dealerData = localStorage.getItem("dealerAuth");

      if (dealerData) {
        const dealer = JSON.parse(dealerData);

        if (dealer?.name && dealer.name.trim()) {
          return dealer.name.trim();
        }
      }
    } catch (error) {
      console.error("Greeting localStorage error:", error);
    }
    return "";
  }, [name]);
  const hour = new Date().getHours();

  let greeting = "Good Evening";

  if (hour < 12) {
    greeting = "Good Morning";
  } else if (hour < 17) {
    greeting = "Good Afternoon";
  }
  return (
    <h3 className="greeting">
      {displayName ? `${greeting} ${displayName}` : greeting}
    </h3>
  );
};

export default Greeting;
