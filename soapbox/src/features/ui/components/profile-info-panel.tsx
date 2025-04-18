import balloonIcon from '@tabler/icons/outline/balloon.svg';
import calendarIcon from '@tabler/icons/outline/calendar.svg';
import linkIcon from '@tabler/icons/outline/link.svg';
import lockIcon from '@tabler/icons/outline/lock.svg';
import mapPinIcon from '@tabler/icons/outline/map-pin.svg';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { usePatronUser } from 'soapbox/api/hooks/index.ts';
import Badge from 'soapbox/components/badge.tsx';
import Markup from 'soapbox/components/markup.tsx';
import { dateFormatOptions } from 'soapbox/components/relative-timestamp.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Icon from 'soapbox/components/ui/icon.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { useSoapboxConfig } from 'soapbox/hooks/useSoapboxConfig.ts';
import { emojifyText } from 'soapbox/utils/emojify.tsx';
import { capitalize } from 'soapbox/utils/strings.ts';

import ProfileFamiliarFollowers from './profile-familiar-followers.tsx';
import ProfileField from './profile-field.tsx';
import ProfileStats from './profile-stats.tsx';

import type { Account } from 'soapbox/schemas/index.ts';

/** Basically ensure the URL isn't `javascript:alert('hi')` or something like that */
const isSafeUrl = (text: string): boolean => {
  try {
    const url = new URL(text);
    return ['http:', 'https:'].includes(url.protocol);
  } catch (e) {
    return false;
  }
};

const messages = defineMessages({
  linkVerifiedOn: { id: 'account.link_verified_on', defaultMessage: 'Ownership of this link was checked on {date}' },
  account_locked: { id: 'account.locked_info', defaultMessage: 'This account privacy status is set to locked. The owner manually reviews who can follow them.' },
  deactivated: { id: 'account.deactivated', defaultMessage: 'Deactivated' },
  bot: { id: 'account.badges.bot', defaultMessage: 'Bot' },
});

interface IProfileInfoPanel {
  account?: Account;
  /** Username from URL params, in case the account isn't found. */
  username: string;
}

/** User profile metadata, such as location, birthday, etc. */
const ProfileInfoPanel: React.FC<IProfileInfoPanel> = ({ account, username }) => {
  const intl = useIntl();
  const { displayFqn } = useSoapboxConfig();
  const { patronUser } = usePatronUser(account?.url);
  const me = useAppSelector(state => state.me);
  const ownAccount = account?.id === me;

  const getStaffBadge = (): React.ReactNode => {
    if (account?.admin) {
      return <Badge slug='admin' title={<FormattedMessage id='account_moderation_modal.roles.admin' defaultMessage='Admin' />} key='staff' />;
    } else if (account?.moderator) {
      return <Badge slug='moderator' title={<FormattedMessage id='account_moderation_modal.roles.moderator' defaultMessage='Moderator' />} key='staff' />;
    } else {
      return null;
    }
  };

  const getCustomBadges = (): React.ReactNode[] => {
    const badges = account?.roles || [];

    return badges.filter(badge => badge.highlighted).map(badge => (
      <Badge
        key={badge.id || badge.name}
        slug={badge.name}
        title={capitalize(badge.name)}
        color={badge.color}
      />
    ));
  };

  const getBadges = (): React.ReactNode[] => {
    const custom = getCustomBadges();
    const staffBadge = getStaffBadge();
    const isPatron = patronUser?.is_patron === true;

    const badges = [];

    if (staffBadge) {
      badges.push(staffBadge);
    }

    if (isPatron) {
      badges.push(<Badge slug='patron' title={<FormattedMessage id='account.patron' defaultMessage='Patron' />} key='patron' />);
    }

    return [...badges, ...custom];
  };

  const renderBirthday = (): React.ReactNode => {
    const birthday = account?.pleroma?.birthday;
    if (!birthday) return null;

    const formattedBirthday = intl.formatDate(birthday, { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' });

    const date = new Date(birthday);
    const today = new Date();

    const hasBirthday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth();

    return (
      <HStack alignItems='center' space={0.5}>
        <Icon
          src={balloonIcon}
          className='size-4 text-gray-800 dark:text-gray-200'
        />

        <Text size='sm'>
          {hasBirthday ? (
            <FormattedMessage id='account.birthday_today' defaultMessage='Birthday is today!' />
          ) : (
            <FormattedMessage id='account.birthday' defaultMessage='Born {date}' values={{ date: formattedBirthday }} />
          )}
        </Text>
      </HStack>
    );
  };

  if (!account) {
    return (
      <div>
        <Stack space={2}>
          <Stack>
            <HStack space={1} alignItems='center'>
              {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
              <Text size='sm' theme='muted' direction='ltr' truncate>
                @{username}
              </Text>
            </HStack>
          </Stack>
        </Stack>
      </div>
    );
  }

  const deactivated = account.pleroma?.deactivated ?? false;
  const memberSinceDate = intl.formatDate(account.created_at, { month: 'long', year: 'numeric' });
  const badges = getBadges();

  return (
    <div>
      <Stack space={2}>
        <Stack>
          <HStack space={1} alignItems='center'>
            <Text size='lg' weight='bold' truncate>
              {deactivated ? intl.formatMessage(messages.deactivated) : emojifyText(account.display_name, account.emojis)}
            </Text>

            {account.bot && <Badge slug='bot' title={intl.formatMessage(messages.bot)} />}

            {badges.length > 0 && (
              <HStack space={1} alignItems='center'>
                {badges}
              </HStack>
            )}
          </HStack>

          <HStack alignItems='center' space={0.5}>
            {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
            <Text size='sm' theme='muted' direction='ltr' truncate>
              @{displayFqn ? account.fqn : account.acct}
            </Text>

            {account.locked && (
              <Icon
                src={lockIcon}
                alt={intl.formatMessage(messages.account_locked)}
                className='size-4 text-gray-600'
              />
            )}
          </HStack>
        </Stack>

        <ProfileStats account={account} />

        {account.note.length > 0 && (
          <Markup size='sm' html={{ __html: account.note }} emojis={account.emojis} truncate />
        )}

        <div className='flex flex-col items-start gap-2 md:flex-row md:flex-wrap md:items-center'>
          {account.local ? (
            <HStack alignItems='center' space={0.5}>
              <Icon
                src={calendarIcon}
                className='size-4 text-gray-800 dark:text-gray-200'
              />

              <Text size='sm' title={intl.formatDate(account.created_at, dateFormatOptions)}>
                <FormattedMessage
                  id='account.member_since' defaultMessage='Joined {date}' values={{
                    date: memberSinceDate,
                  }}
                />
              </Text>
            </HStack>
          ) : null}

          {account.location ? (
            <HStack alignItems='center' space={0.5}>
              <Icon
                src={mapPinIcon}
                className='size-4 text-gray-800 dark:text-gray-200'
              />

              <Text size='sm'>
                {account.location}
              </Text>
            </HStack>
          ) : null}

          {account.website ? (
            <HStack alignItems='center' space={0.5}>
              <Icon
                src={linkIcon}
                className='size-4 text-gray-800 dark:text-gray-200'
              />

              <div className='max-w-[300px]'>
                <Text size='sm' truncate>
                  {isSafeUrl(account.website) ? (
                    <a className='text-primary-600 hover:underline dark:text-accent-blue' href={account.website} target='_blank'>{account.website}</a>
                  ) : (
                    account.website
                  )}
                </Text>
              </div>
            </HStack>
          ) : null}

          {renderBirthday()}
        </div>

        {ownAccount ? null : <ProfileFamiliarFollowers account={account} />}
      </Stack>

      {account.fields.length > 0 && (
        <Stack space={2} className='mt-4 xl:hidden'>
          {account.fields.map((field, i) => (
            <ProfileField field={field} key={i} />
          ))}
        </Stack>
      )}
    </div>
  );
};

export default ProfileInfoPanel;
