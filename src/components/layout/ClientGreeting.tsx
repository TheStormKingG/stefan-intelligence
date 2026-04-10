"use client";

import { useEffect, useState } from "react";

function getLocalGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

interface ClientGreetingProps {
  name: string;
}

export function ClientGreeting({ name }: ClientGreetingProps) {
  const [greeting, setGreeting] = useState<string | null>(null);

  useEffect(() => {
    setGreeting(getLocalGreeting());
  }, []);

  if (!greeting) return null;

  return (
    <>
      {greeting}, {name}
    </>
  );
}
