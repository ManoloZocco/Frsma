import searchIcon from '@tabler/icons/outline/search.svg';
import xIcon from '@tabler/icons/outline/x.svg';
import clsx from 'clsx';
import { debounce } from 'es-toolkit';
import { useCallback, useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import {
  changeSearch,
  clearSearch,
  clearSearchResults,
  setSearchAccount,
  showSearch,
  submitSearch,
} from 'soapbox/actions/search.ts';
import AutosuggestAccountInput from 'soapbox/components/autosuggest-account-input.tsx';
import Input from 'soapbox/components/ui/input.tsx';
import SvgIcon from 'soapbox/components/ui/svg-icon.tsx';
import { useSearchTokens } from 'soapbox/features/explore/useSearchTokens.ts';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { selectAccount } from 'soapbox/selectors/index.ts';
import { AppDispatch, RootState } from 'soapbox/store.ts';

const messages = defineMessages({
  placeholder: { id: 'search.placeholder', defaultMessage: 'Search' },
  action: { id: 'search.action', defaultMessage: 'Search for “{query}”' },
});

function redirectToAccount(accountId: string, routerHistory: any) {
  return (_dispatch: AppDispatch, getState: () => RootState) => {
    const acct = selectAccount(getState(), accountId)!.acct;

    if (acct && routerHistory) {
      routerHistory.push(`/@${acct}`);
    }
  };
}

interface ISearch {
  autoFocus?: boolean;
  autoSubmit?: boolean;
  autosuggest?: boolean;
  openInRoute?: boolean;
}

const Search = (props: ISearch) => {
  const {
    autoFocus = false,
    autoSubmit = false,
    autosuggest = false,
    openInRoute = false,
  } = props;

  const dispatch = useAppDispatch();
  const history = useHistory();
  const intl = useIntl();
  const [inputValue, setInputValue] = useState('');
  const { addToken } = useSearchTokens();

  const value = useAppSelector((state) => state.search.value);
  const submitted = useAppSelector((state) => state.search.submitted);

  const debouncedSubmit = useCallback(debounce(() => {
    dispatch(submitSearch());
  }, 900), []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    dispatch(changeSearch(value));
    setInputValue(value);

    if (autoSubmit) {
      debouncedSubmit();
    }
  };

  const handleClear = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (value.length > 0 || submitted) {
      dispatch(clearSearchResults());
    }
  };

  const handleSubmit = () => {
    if (openInRoute) {
      addToken(value);
      dispatch(setSearchAccount(null));
      dispatch(submitSearch());
      history.push('/explore');
    } else {
      addToken(value);
      dispatch(submitSearch());
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      handleSubmit();
    } else if (event.key === 'Escape') {
      document.querySelector('.ui')?.parentElement?.focus();
    }
  };

  const handleFocus = () => {
    dispatch(showSearch());
  };

  const handleSelected = (accountId: string) => {
    dispatch(clearSearch());
    dispatch(redirectToAccount(accountId, history));
  };

  const makeMenu = () => [
    {
      text: intl.formatMessage(messages.action, { query: value }),
      icon: searchIcon,
      action: handleSubmit,
    },
  ];

  const hasValue = value.length > 0 || submitted;
  const componentProps: any = {
    type: 'text',
    id: 'search',
    placeholder: intl.formatMessage(messages.placeholder),
    value: inputValue,
    onChange: handleChange,
    onKeyDown: handleKeyDown,
    onFocus: handleFocus,
    autoFocus: autoFocus,
    theme: 'search',
    className: 'pr-10 rtl:pl-10 rtl:pr-3',
  };

  if (autosuggest) {
    componentProps.onSelected = handleSelected;
    componentProps.menu = makeMenu();
    componentProps.autoSelect = false;
  }

  useEffect(() => {
    return () => {
      const newPath = history.location.pathname;
      const shouldPersistSearch = !!newPath.match(/@.+\/posts\/[a-zA-Z0-9]+/g)
        || !!newPath.match(/\/tags\/.+/g);

      if (!shouldPersistSearch) {
        dispatch(changeSearch(''));
      }
    };
  }, []);

  return (
    <div className='w-full'>
      <label htmlFor='search' className='sr-only'>{intl.formatMessage(messages.placeholder)}</label>

      <div className='relative'>
        {autosuggest ? (
          <AutosuggestAccountInput {...componentProps} />
        ) : (
          <Input {...componentProps} />
        )}

        <div
          role='button'
          tabIndex={0}
          className='absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 rtl:left-0 rtl:right-auto'
          onClick={handleClear}
        >
          <SvgIcon
            src={searchIcon}
            className={clsx('size-4 text-gray-600', { hidden: hasValue })}
          />

          <SvgIcon
            src={xIcon}
            className={clsx('size-4 text-gray-600', { hidden: !hasValue })}
            aria-label={intl.formatMessage(messages.placeholder)}
          />
        </div>
      </div>
    </div>
  );
};

export default Search;
