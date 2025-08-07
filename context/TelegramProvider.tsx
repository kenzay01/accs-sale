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
    let attempts = 0;
    const maxAttempts = 50; // 5 секунд максимум

    const checkTelegram = () => {
      attempts++;
      console.log(`Attempt ${attempts}: Checking for Telegram WebApp...`);

      // Перевіряємо наявність Telegram об'єкта
      if (typeof window !== "undefined") {
        console.log("Window object exists");
        console.log("window.Telegram:", (window as any).Telegram);

        if ((window as any).Telegram?.WebApp) {
          const app: IWebApp = (window as any).Telegram.WebApp;
          console.log("Telegram WebApp found:", app);
          console.log("WebApp initData:", app.initData);
          console.log("WebApp initDataUnsafe:", app.initDataUnsafe);
          console.log("WebApp user:", app.initDataUnsafe?.user);

          app.ready(); // Initialize the Web App
          app.expand(); // Optional: Expand to full screen
          setWebApp(app);
          return;
        }
      }

      // Retry if script hasn't loaded and we haven't exceeded max attempts
      if (attempts < maxAttempts) {
        setTimeout(checkTelegram, 100);
      } else {
        console.error(
          "Failed to initialize Telegram WebApp after maximum attempts"
        );
        console.log("Make sure the app is opened inside Telegram");
      }
    };

    checkTelegram();

    return () => setWebApp(null); // Cleanup
  }, []);

  const value = useMemo(() => {
    console.log("TelegramProvider value update:", {
      webApp,
      user: webApp?.initDataUnsafe?.user,
    });

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
