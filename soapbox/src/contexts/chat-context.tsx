import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { toggleMainWindow } from 'soapbox/actions/chats.ts';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useOwnAccount } from 'soapbox/hooks/useOwnAccount.ts';
import { useSettings } from 'soapbox/hooks/useSettings.ts';
import { IChat, useChat } from 'soapbox/queries/chats.ts';

const ChatContext = createContext<any>({
  isOpen: false,
  needsAcceptance: false,
});

enum ChatWidgetScreens {
  INBOX = 'INBOX',
  SEARCH = 'SEARCH',
  CHAT = 'CHAT',
  CHAT_SETTINGS = 'CHAT_SETTINGS'
}

interface IChatProvider {
  children: React.ReactNode;
}

const ChatProvider: React.FC<IChatProvider> = ({ children }) => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const { chats } = useSettings();
  const { account } = useOwnAccount();

  const path = history.location.pathname;
  const isUsingMainChatPage = Boolean(path.match(/^\/chats/));
  const { chatId } = useParams<{ chatId: string }>();

  const [screen, setScreen] = useState<ChatWidgetScreens>(ChatWidgetScreens.INBOX);
  const [currentChatId, setCurrentChatId] = useState<null | string>(chatId);

  const { data: chat } = useChat(currentChatId as string);

  const needsAcceptance = !chat?.accepted && chat?.created_by_account !== account?.id;
  const isOpen = chats.mainWindow === 'open';

  const changeScreen = (screen: ChatWidgetScreens, currentChatId?: string | null) => {
    setCurrentChatId(currentChatId || null);
    setScreen(screen);
  };

  const toggleChatPane = () => dispatch(toggleMainWindow());

  const value = useMemo(() => ({
    chat,
    needsAcceptance,
    isOpen,
    isUsingMainChatPage,
    toggleChatPane,
    screen,
    changeScreen,
    currentChatId,
  }), [chat, currentChatId, needsAcceptance, isUsingMainChatPage, isOpen, screen, changeScreen]);

  useEffect(() => {
    if (chatId) {
      setCurrentChatId(chatId);
    } else {
      setCurrentChatId(null);
    }
  }, [chatId]);

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

interface IChatContext {
  chat: IChat | null;
  isOpen: boolean;
  isUsingMainChatPage?: boolean;
  needsAcceptance: boolean;
  toggleChatPane(): void;
  screen: ChatWidgetScreens;
  currentChatId: string | null;
  changeScreen(screen: ChatWidgetScreens, currentChatId?: string | null): void;
}

const useChatContext = (): IChatContext => useContext(ChatContext);

export { ChatContext, ChatProvider, useChatContext, ChatWidgetScreens };
