export interface ITelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface IWebApp {
  initData: string;
  initDataUnsafe: {
    user?: ITelegramUser;
    [key: string]: any;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
  disableVerticalSwipes: () => void;
  requestFullscreen: () => void;
  // Add other methods as needed (e.g., showPopup, onEvent)
}
