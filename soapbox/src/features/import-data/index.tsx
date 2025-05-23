import { defineMessages, useIntl } from 'react-intl';

import {
  importFollows,
  importBlocks,
  importMutes,
} from 'soapbox/actions/import-data.ts';
import { Column } from 'soapbox/components/ui/column.tsx';

import CSVImporter from './components/csv-importer.tsx';

const messages = defineMessages({
  heading: { id: 'column.import_data', defaultMessage: 'Import data' },
  submit: { id: 'import_data.actions.import', defaultMessage: 'Import' },
});

const followMessages = defineMessages({
  input_label: { id: 'import_data.follows_label', defaultMessage: 'Follows' },
  input_hint: { id: 'import_data.hints.follows', defaultMessage: 'CSV file containing a list of followed accounts' },
  submit: { id: 'import_data.actions.import_follows', defaultMessage: 'Import follows' },
});

const blockMessages = defineMessages({
  input_label: { id: 'import_data.blocks_label', defaultMessage: 'Blocks' },
  input_hint: { id: 'import_data.hints.blocks', defaultMessage: 'CSV file containing a list of blocked accounts' },
  submit: { id: 'import_data.actions.import_blocks', defaultMessage: 'Import blocks' },
});

const muteMessages = defineMessages({
  input_label: { id: 'import_data.mutes_label', defaultMessage: 'Mutes' },
  input_hint: { id: 'import_data.hints.mutes', defaultMessage: 'CSV file containing a list of muted accounts' },
  submit: { id: 'import_data.actions.import_mutes', defaultMessage: 'Import mutes' },
});

const ImportData = () => {
  const intl = useIntl();

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <CSVImporter action={importFollows} messages={followMessages} />
      <CSVImporter action={importBlocks} messages={blockMessages} />
      <CSVImporter action={importMutes} messages={muteMessages} />
    </Column>
  );
};

export default ImportData;
