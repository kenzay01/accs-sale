"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ITelegramUser, IWebApp } from "../types/telegram";

export interface ITelegramContext {
  webApp?: IWebApp;
  user?: ITelegramUser;
}

export const TelegramContext = createContext<ITelegramContext>({});

export const TelegramProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [webApp, setWebApp] = useState<IWebApp | null>(null);

  useEffect(() => {
    const checkTelegram = () => {
      if ((window as any).Telegram?.WebApp) {
        const app: IWebApp = (window as any).Telegram.WebApp;
        app.ready(); // Initialize the Web App
        app.expand(); // Optional: Expand to full screen
        setWebApp(app);
      } else {
        // Retry if script hasn't loaded
        setTimeout(checkTelegram, 100);
      }
    };

    checkTelegram();

    return () => setWebApp(null); // Cleanup
  }, []);

  const value = useMemo(() => {
    return webApp
      ? {
          webApp,
          user: webApp.initDataUnsafe?.user,
        }
      : {};
  }, [webApp]);

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  );
};

export const useTelegram = () => useContext(TelegramContext);
